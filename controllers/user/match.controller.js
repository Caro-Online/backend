const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { matchService } = require('../../services');

const createMatch = catchAsync(async (req, res) => {
    const { players, roomId } = req.body;
    const match = await matchService.createMatch(players, roomId);
    res.status(httpStatus.OK).json({ success: true, match });
});

const getCurrentMatchByIdOfRoom = catchAsync(async (req, res) => {
    const { roomId } = req.params;
    const match = await matchService.getCurrentMatchByIdOfRoom(roomId);
    res.status(httpStatus.OK).json({ success: true, match: match[0] });
})

const addMove = catchAsync(async (req, res) => {
    const { index, matchId, xIsNext } = req.body;
    const match = await matchService.addMove(matchId, index, xIsNext);
    res.status(httpStatus.OK).json({ success: true, match });
})

module.exports = {
    createMatch,
    getCurrentMatchByIdOfRoom,
    addMove
}