const cryptoRandomString = require('crypto-random-string');
const httpStatus = require('http-status');

const { Game } = require('../models');
const ApiError = require('../utils/ApiError');

const getAllRoom = () => {
  return Game.find(
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
  const room = await Game.findOne({ roomId });
  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Room not found');
  }
  return room;
};

const createRoom = (name, userId, rule) => {
  // Create random roomId
  const roomId = cryptoRandomString({ length: 6, type: 'base64' });
  const room = new Game({
    roomId,
    name,
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

// const updateCurrentRoom = async (userId, roomId) => {
//   const room = await getRoomByRoomId(roomId);
//   room.
// };

module.exports = {
  getAllRoom,
  getRoomByRoomId,
  createRoom,
  // updateCurrentRoom,
};
