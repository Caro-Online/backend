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
    .populate('owner');
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
  let users = [];
  users.push(userId);
  const room = new Room({
    roomId,
    name,
    password: roomPassword,
    users,
    owner: userId,
    status: 'WAITING',
    rule,
  });
  return room.save();
};

const joinRoom = (userId, roomId) => {
  const filter = { roomId: roomId };
  const update = { $addToSet: { audience: userId } };
  return Room.findOneAndUpdate(filter, update, { new: true }).populate(
    'audiences'
  );
};

const outRoom = (userId, roomId) => {
  return Room.findOneAndUpdate(
    { roomId: roomId },
    {
      $pull: { audience: userId },
    },
    { new: true }
  );
};

// const joinMatch = (userId, roomId) => {
//   const filter = { roomId: roomId };
//   const update = {
//     $set: {
//       'user.u2.userRef': userId,
//     },
//   };
//   return Room.findOneAndUpdate(filter, update, { new: true });
// };

// const updateCurrentRoom = async (userId, roomId) => {
//   const room = await getRoomByRoomId(roomId);
//   room.
// };

module.exports = {
  getAllRoom,
  getRoomByRoomId,
  createRoom,
  joinRoom,
  //joinMatch,
  outRoom,
  // updateCurrentRoom,
};
