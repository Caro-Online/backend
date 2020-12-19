const cryptoRandomString = require('crypto-random-string');
const httpStatus = require('http-status');

const { Room } = require('../models');
const { populate } = require('../models/user.model');
const ApiError = require('../utils/ApiError');

const getAllRoom = () => {
  return Room.find(
    {},
    {
      _id: 1,
      roomId: 1,
      name: 1,
      user: 1,
      status: 1,
      rule: 1,
      audience: 1,
      status: 1,
      owner: 1,
    }
  );
};

const getRoomByRoomId = async (roomId) => {
  const room = await Room.findOne({ roomId })
    .populate('chat.user')
    .populate('owner')
    .populate('user.u1.userRef')
    .populate('user.u2.userRef')
    .populate('audience');
  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Room not found');
  }
  return room;
};

const createRoom = (name, userId, rule, roomPassword) => {
  // Create random roomId
  const roomId = cryptoRandomString({ length: 6, type: 'hex' });
  console.log(roomPassword);
  const room = new Room({
    roomId,
    name,
    password: roomPassword,
    owner: userId,
    user: {
      u1: {
        userRef: userId,
      },
    },
    status: 'WAITING',
    rule,
  });
  return room.save();
};



const joinRoom = (userId, roomId) => {
  const filter = { roomId: roomId };
  const update = { $addToSet: { audience: userId } }
  return Room.findOneAndUpdate(filter, update, { new: true })
    .populate('audience');
}

const outRoom = (userId, roomId) => {
  return Room.findOneAndUpdate({ roomId: roomId }, {
    $pull: { audience: userId }
  }, { new: true })
}

const joinMatch = (userId, roomId) => {
  const filter = { roomId: roomId };
  const update = {
    $set: {
      "user.u2.userRef": userId
    }
  }
  return Room.findOneAndUpdate(filter, update, { new: true })
}



// const updateCurrentRoom = async (userId, roomId) => {
//   const room = await getRoomByRoomId(roomId);
//   room.
// };

module.exports = {
  getAllRoom,
  getRoomByRoomId,
  createRoom,
  joinRoom,
  joinMatch,
  outRoom
  // updateCurrentRoom,
};
