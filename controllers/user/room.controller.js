const httpStatus = require("http-status");

const catchAsync = require("../../utils/catchAsync");
const { userService, roomService, socketService } = require("../../services");

const { emitRoomData } = require("../../services/socket.service");

const getAllRoom = catchAsync(async (req, res) => {
  const { isFull } = req.query;
  let rooms = [];
  if (isFull) rooms = await roomService.getRooms();
  else {
    rooms = await roomService.getAllRoom();
  }
  if (!rooms || rooms.length === 0) {
    return res.status(httpStatus.OK).json({ success: true, rooms: [] });
  }
  return res.status(httpStatus.OK).json({ success: true, rooms });
});

const getRandomRoom = catchAsync(async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await userService.getUserById(userId);
    const cup = user.cup;
    const room = await roomService.getRandom(cup);
    res.status(httpStatus.OK).json({ success: true, room });
  } catch (err) {
    res.status(httpStatus.ERROR).json({ success: false, err });
  }
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
  const { name, userId, rule, roomPassword, countdownDuration } = req.body;
  const room = await roomService.createRoom(
    name,
    userId,
    rule,
    roomPassword,
    countdownDuration
  );
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
  socketService.emitRoomUpdate(room);
  if (room) {
    res.status(httpStatus.OK).json({ success: true, room });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ success: false });
  }
});

const updatePlayerIsReady = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const { isReady, userId } = req.body;
  const room = await roomService.updatePlayerIsReady(roomId, userId, isReady);
  if (room) {
    res.status(httpStatus.OK).json({ success: true, room });
  } else {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ success: false, message: "Lỗi Cập nhật trạng thái người chơi" });
  }
});

const updateRoomWhenPlayerNotReady = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;
  const room = await roomService.updateRoomWhenPlayerNotReady(roomId, userId);
  res.status(httpStatus.OK).json({ success: true, room });
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
  updatePlayerIsReady,
  updateRoomWhenPlayerNotReady,
};
