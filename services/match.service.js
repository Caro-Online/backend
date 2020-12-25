const cryptoRandomString = require('crypto-random-string');
const httpStatus = require('http-status');
const { Match } = require('../models');
const ApiError = require('../utils/ApiError');

const getMatchByMatchId = async (matchId) => {
    const match = await Match.findOne({ matchId })
    if (!match) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            'Không thể tìm thấy trận tương ứng!'
        );
    }
    return match;
};

const createMatch = (players, roomId,) => {
    users.push(userId);
    const match = new Match({
        room: roomId,
        players: players,
        history: [],
        winner: null
    });
    return match.save();
};

module.exports = {
    createMatch,
    getMatchByMatchId
};
