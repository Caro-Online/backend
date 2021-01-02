const cryptoRandomString = require('crypto-random-string');
const httpStatus = require('http-status');

const { Room } = require('../models');
const { populate } = require('../models/user.model');
const ApiError = require('../utils/ApiError');

const getAllRoom = async () => {
  const rooms = await Room.find({});
  if (!rooms || rooms.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không thể tìm thấy phòng nào!');
  }
  return rooms;
};
const getRandom = async () => {
  const rooms = await Room.find({ status: 'WAITING' })
    .sort({ createdAt: -1 })
    .limit(1);
  if (!rooms || rooms.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không thể tìm thấy phòng nào!');
  }
  return rooms[0];
};

const getRoomByRoomId = async (roomId) => {
  const room = await Room.findOne({ roomId })
    .populate({ path: 'chat', populate: { path: 'user' } })
    .populate('audiences')
    .populate('players.user');
  if (!room) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Không thể tìm thấy phòng tương ứng!'
    );
  }
  return room;
};
const getRoomById = async (id) => {
  const room = await Room.findOne({ _id: id })
    .populate({ path: 'chat', populate: { path: 'user' } })
    .populate('audiences')
    .populate('players.user');
  // if (!room) {
  //   throw new ApiError(
  //     httpStatus.NOT_FOUND,
  //     "Không thể tìm thấy phòng tương ứng!"
  //   );
  // }
  return room;
};

const createRoom = (name, userId, rule, roomPassword) => {
  // Create random roomId
  const roomId = cryptoRandomString({ length: 6, type: 'hex' });
  const room = new Room({
    roomId,
    name,
    password: roomPassword,
    players: [
      {
        user: userId,
        isReady: true,
      },
    ],
    status: 'WAITING',
    rule,
  });
  return room.save();
};

const joinRoom = async (userId, roomId) => {
  const filter = { roomId: roomId };
  const room = await Room.findOne(filter);
  if (!room) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Không thể tìm thấy phòng tương ứng!'
    );
  }
  const update = { $addToSet: { audiences: userId } };
  return Room.findOneAndUpdate(filter, update, { new: true })
    .populate({ path: 'chat', populate: { path: 'user' } })
    .populate('audiences')
    .populate('players.user');
};

const outRoom = async (userId, roomId) => {
  try {
    let room = await Room.findOne({ roomId })
      .populate({ path: 'chat', populate: { path: 'user' } })
      .populate('audiences')
      .populate('players.user')
      .exec();
    console.log('Room' + room._id);
    let userInAudiences = true;
    room.players.forEach((player) => {
      if (player.user._id.toString() === userId.toString()) {
        userInAudiences = false;
      }
    });
    // Nếu user nằm trong audiences thì out khỏi audiences
    if (userInAudiences) {
      updatedAudiences = room.audiences.filter(
        (audience) => audience._id.toString() !== userId.toString()
      );
      room.audiences = updatedAudiences;
    } else {
      // Nếu nằm trong players mà trạng thái phòng khác đang chơi thì cho user out khỏi players
      if (room.status !== 'PLAYING') {
        updatedPlayers = room.players.filter(
          (player) => player.user._id.toString() !== userId.toString()
        );
        room.players = updatedPlayers;
      }
    }
    // Nếu không còn ai trong phòng thì set status = EMPTY
    if (room.players.length + room.audiences.length === 0) {
      room.status = 'EMPTY';
    }
    room.save();
    return room;
  } catch (error) {
    console.log('Here' + error);
  }
};

const joinPlayerQueue = async (userId, roomId) => {
  const filter = { roomId: roomId };
  const update = {
    $addToSet: {
      players: { user: userId, isReady: true },
    },
    $pull: {
      audiences: userId,
    },
  };
  const room = await Room.findOne(filter);
  if (room.players.length === 2) {
    return null;
  } else {
    return await Room.findOneAndUpdate(filter, update, { new: true }).populate(
      'players.user'
    );
  }
};

// const updateCurrentRoom = async (userId, roomId) => {
//   const room = await getRoomByRoomId(roomId);
//   room.
// };

const updateRoomStatus = (roomId, status) => {
  console.log(roomId + status);
  return Room.findOneAndUpdate({ roomId }, { status }, { new: true });
};

module.exports = {
  getAllRoom,
  getRoomByRoomId,
  getRoomById,
  createRoom,
  joinRoom,
  joinPlayerQueue,
  outRoom,
  updateRoomStatus,
  getRandom,
};
