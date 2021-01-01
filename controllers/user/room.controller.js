const httpStatus = require("http-status");

const catchAsync = require("../../utils/catchAsync");
const { roomService, socketService } = require("../../services");
const { emitRoomData } = require("../../services/socket.service");

const getAllRoom = catchAsync(async (req, res) => {
  const rooms = await roomService.getAllRoom();
  res.status(httpStatus.OK).json({ success: true, rooms });
});
const getRandomRoom = catchAsync(async (req, res) => {
  const room = await roomService.getRandom();
  res.status(httpStatus.OK).json({ success: true, room });
});

const getRoom = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const room = await roomService.getRoomByRoomId(roomId);
  res.status(httpStatus.OK).json({ success: true, room });
});
const getRoomDetail = catchAsync(async (req, res) => {
  const { id } = req.params;
  const room = await roomService.getRoomById(id);
  res.status(httpStatus.OK).json({ success: true, room });
});

const createRoom = catchAsync(async (req, res) => {
  const { name, userId, rule, roomPassword } = req.body;
  const room = await roomService.createRoom(name, userId, rule, roomPassword);
  socketService.emitNewRoom(room);
  res.status(httpStatus.OK).json({ success: true, room });
});

const joinRoom = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const { roomId } = req.params;
  const room = await roomService.joinRoom(userId, roomId);
  socketService.emitRoomUpdate(room);
  res.status(httpStatus.OK).json({ success: true, room });
});
const outRoom = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const { roomId } = req.params;
  const room = await roomService.outRoom(userId, roomId);
  console.log("Here");
  res.status(httpStatus.OK).json({ success: true, room });
});

const joinPlayerQueue = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const { roomId } = req.params;
  const room = await roomService.joinPlayerQueue(userId, roomId);
  if (room) {
    console.log(room);
    emitRoomData(room);
    res.status(httpStatus.OK).json({ success: true, room });
  } else {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ success: false, message: "Phòng đã đầy" });
  }
});

const updateRoomStatus = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const { status } = req.body;
  const room = await roomService.updateRoomStatus(roomId, status);
  if (room) {
    res.status(httpStatus.OK).json({ success: true, room });
  } else {
    res.status(httpStatus.OK).json({ success: false });
  }
});

module.exports = {
  getRandomRoom,
  getAllRoom,
  getRoom,
  getRoomDetail,
  createRoom,
  joinRoom,
  joinPlayerQueue,
  outRoom,
  updateRoomStatus,
};
