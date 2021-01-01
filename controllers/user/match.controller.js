const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { matchService } = require("../../services");

const createMatch = catchAsync(async (req, res) => {
  const { players, roomId } = req.body;
  const match = await matchService.createMatch(players, roomId);
  res.status(httpStatus.OK).json({ success: true, match });
});

const getCurrentMatchByIdOfRoom = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const match = await matchService.getCurrentMatchByIdOfRoom(roomId);
  console.log(match);
  if (match.length === 0) {
    res
      .status(httpStatus.OK)
      .json({ success: false, message: "Khong co van dau hien tai" });
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
  const { index, matchId, xIsNext } = req.body;
  const match = await matchService.addMove(matchId, index, xIsNext);
  res.status(httpStatus.OK).json({ success: true, match });
});

const getMatchById = catchAsync(async (req, res) => {
  const { matchId } = req.params;
  const match = await matchService.getMatchByMatchId(matchId);
  res.status(httpStatus.OK).json({ success: true, match });
});

module.exports = {
  createMatch,
  getCurrentMatchByIdOfRoom,
  addMove,
  getMatchById,
  getMatchesHistoryByUserId,
  getMatchesHistory,
};
