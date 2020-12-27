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

const joinRoom = (userId, roomId) => {
  const filter = { roomId: roomId };
  const update = { $addToSet: { audiences: userId } };
  return Room.findOneAndUpdate(filter, update, { new: true }).populate(
    'audiences'
  );
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
    if (userInAudiences) {
      updatedAudiences = room.audiences.filter(
        (audience) => audience._id.toString() !== userId.toString()
      );
      room.audiences = updatedAudiences;
      room = await room.save();
    } else {
      updatedPlayers = room.players.filter(
        (player) => player.user._id.toString() !== userId.toString()
      );
      room.players = updatedPlayers;
      room = await room.save();
    }
    return room;
  } catch (error) {
    console.log('Here' + error);
  }
};

const joinPlayerQueue = (userId, roomId) => {
  const filter = { roomId: roomId };
  const update = {
    $addToSet: {
      players: { user: userId, isReady: true },
    },
  };
  return Room.findOneAndUpdate(filter, update, { new: true }, (eror, room) => {
    console.log(room.players);
  });
};

// const updateCurrentRoom = async (userId, roomId) => {
//   const room = await getRoomByRoomId(roomId);
//   room.
// };

module.exports = {
  getAllRoom,
  getRoomByRoomId,
  createRoom,
  joinRoom,
  joinPlayerQueue,
  outRoom,
  // updateCurrentRoom,
};
