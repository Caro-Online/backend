const httpStatus = require('http-status');

const catchAsync = require('../../utils/catchAsync');
const { gameService } = require('../../services');

const getAllRoom = catchAsync(async (req, res) => {
  const rooms = await gameService.getAllRoom();
  res.status(httpStatus.OK).json({ success: true, rooms });
});

const getRoom = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const room = await gameService.getRoomByRoomId(roomId);
  res.status(httpStatus.OK).json({ success: true, room });
});

const createRoom = catchAsync(async (req, res) => {
  const { name, userId, rule } = req.body;
  const room = await gameService.createRoom(name, userId, rule);
  res.status(httpStatus.OK).json({ success: true, room });
});

module.exports = {
  getAllRoom,
  getRoom,
  createRoom,
};
