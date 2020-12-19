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
  const { name, userId, rule } = req.body;
  const room = await roomService.createRoom(name, userId, rule);
  res.status(httpStatus.OK).json({ success: true, room });
});


const joinRoom = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const { roomId } = req.params;
  const room = await roomService.joinRoom(userId, roomId);
  res.status(httpStatus.OK).json({ success: true, room })
})
const outRoom = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const { roomId } = req.params;
  const room = await roomService.outRoom(userId, roomId);
  res.status(httpStatus.OK).json({ success: true, room })
})

const joinMatch = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const { roomId } = req.params;
  const room = await roomService.joinMatch(userId, roomId);
  if (room) {
    res.status(httpStatus.OK).json({ success: true, room })
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "Phòng đã đầy" })
  }

})


module.exports = {
  getAllRoom,
  getRoom,
  createRoom,
  joinRoom,
  joinMatch,
  outRoom
};
