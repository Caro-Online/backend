const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { matchService, roomService } = require('../../services');

const createMatch = catchAsync(async (req, res) => {
  const { players, roomId, countdownDuration } = req.body;
  // tìm countdownduration của room
  const match = await matchService.createMatch(
    players,
    roomId,
    countdownDuration
  );
  res.status(httpStatus.OK).json({ success: true, match });
});

const getCurrentMatchByIdOfRoom = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const match = await matchService.getCurrentMatchByIdOfRoom(roomId);
  if (match.length === 0) {
    res
      .status(httpStatus.OK)
      .json({ success: false, message: 'Khong co van dau hien tai' });
  } else {
    res.status(httpStatus.OK).json({ success: true, match: match[0] });
  }
});

const getMatchesHistory = catchAsync(async (req, res) => {
  const data = req.query;
  console.log(req.query, data);
  const matches = await matchService.getHistory(data);
  res.status(httpStatus.OK).json({ success: true, matches });
});

const getMatchesHistoryByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const matches = await matchService.getHistoryByUserId(userId);
  res.status(httpStatus.OK).json({ success: true, matches });
});

const addMove = catchAsync(async (req, res) => {
  const { index, matchId, xIsNext, roomId } = req.body;
  const room = await roomService.getRoomByRoomId(roomId);
  const match = await matchService.addMove(matchId, index, xIsNext, room);
  res.status(httpStatus.OK).json({ success: true, match });
});

const getMatchById = catchAsync(async (req, res) => {
  const { matchId } = req.params;
  const match = await matchService.getMatchByMatchId(matchId);
  res.status(httpStatus.OK).json({ success: true, match });
});

const endMatch = catchAsync(async (req, res) => {
  const { matchId } = req.params;
  const { loserId } = req.body;
  const endData = await matchService.endMatch(matchId, loserId);
  if (endData) {
    res.status(httpStatus.OK).json({ success: true, endData });
  } else {
    res
      .status(httpStatus.OK)
      .json({ success: false, message: 'end match failed' });
  }
});

module.exports = {
  createMatch,
  getCurrentMatchByIdOfRoom,
  addMove,
  getMatchById,
  getMatchesHistoryByUserId,
  getMatchesHistory,
  endMatch,
};
