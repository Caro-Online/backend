const cryptoRandomString = require("crypto-random-string");
const httpStatus = require("http-status");
const { Match } = require("../models");
const ApiError = require("../utils/ApiError");

const getMatchByMatchId = async (matchId) => {
  const match = await Match.findOne({ matchId });
  if (!match) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Không thể tìm thấy trận tương ứng!"
    );
  }
  return match;
};
//roomId: _id
const createMatch = (players, roomId) => {
  const match = new Match({
    room: roomId,
    players: players,
    history: [],
    winner: null,
  });
  return match.save();
};
// Id of room = _id (khác với RoomId)
//Trả về match tạo sau nhất theo createdAt
const getCurrentMatchByIdOfRoom = (roomId) => {
    console.log("roomId: " + roomId)
    const match = Match.find({ room: roomId }).sort({ createdAt: -1 }).limit(1)
    if (match) return match
    return null
}

//thêm 1 bước đi vào lich sử
const addMove = (matchId, index, xIsNext) => {
    const filter = { _id: matchId };
    const update = {
        $push: {
            history: index,
        },
        xIsNext: xIsNext
    };
    return Match.findOneAndUpdate(filter, update, { new: true })
}

module.exports = {
  createMatch,
  getMatchByMatchId,
  getCurrentMatchByIdOfRoom,
  addMove,
  // getHistoryByUserId,
};
