const httpStatus = require('http-status');

const catchAsync = require('../../utils/catchAsync');
const { roomService } = require('../../services');

const getAllRoom = catchAsync(async (req, res) => {
  const rooms = await roomService.getAllRoom();
  res.status(httpStatus.OK).json({ success: true, rooms });
});

const getRoom = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const room = await roomService.getRoomByRoomId(roomId);
  res.status(httpStatus.OK).json({ success: true, room });
});

const createRoom = catchAsync(async (req, res) => {
  const { name, userId, rule, roomPassword } = req.body;
  const room = await roomService.createRoom(name, userId, rule, roomPassword);
  res.status(httpStatus.OK).json({ success: true, room });
});

module.exports = {
  getAllRoom,
  getRoom,
  createRoom,
};
