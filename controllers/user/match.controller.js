const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { matchService } = require('../../services');

const createMatch = catchAsync(async (req, res) => {
    const rooms = await matchService.createMatch();
    res.status(httpStatus.OK).json({ success: true, match });
});

module.exports = {
    createMatch
}