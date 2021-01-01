const cryptoRandomString = require("crypto-random-string");
const httpStatus = require("http-status");
const { Match } = require("../models");
const ApiError = require("../utils/ApiError");

const getMatchByMatchId = async (matchId) => {
  const match = await Match.findById(matchId);
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
const getCurrentMatchByIdOfRoom = async (roomId) => {
  console.log("roomId: " + roomId);
  const match = await Match.find({ room: roomId })
    .sort({ createdAt: -1 })
    .limit(1)
    .populate("players");
  return match;
};

const getHistoryByUserId = (userId) => {
  console.log("getHistoryByUserId", userId);
  const match = Match.find({
    players: {
      $in: userId,
    },
  }).sort({ createdAt: -1 });
  return match;
};
const getHistory = (data) => {
  console.log("getHistory", data);
  const match = Match.find({
    room: data.roomId,
  })
    .sort({ createdAt: -1 })
    .populate("players");
  return match;
};
//thêm 1 bước đi vào lich sử
const addMove = (matchId, index, xIsNext) => {
  const filter = { _id: matchId };
  const update = {
    $push: {
      history: index,
    },
    xIsNext: xIsNext,
  };
  return Match.findOneAndUpdate(filter, update, { new: true }).populate("room");
};
const boardSize = 17;

const create2DArray = () => {
  let array = Array(boardSize);
  for (let i = 0; i < boardSize; i++) {
    array[i] = Array(boardSize).fill("null");
  }
  return array;
};
const historyTo2DArray = (history) => {
  //Tạo mảng 2 chiều mới
  let array = create2DArray();
  //duyệt history
  for (let h = 0; h < history.length; h++) {
    let i = Math.floor(history[h] / boardSize);
    let j = history[h] % boardSize;
    array[i][j] = h % 2 === 0 ? "X" : "O";
  }

  return array;
};

const alogithmn = (b, i, j) => {
  let d = Array();
  let k = i;
  let h;
  // kiểm tra hàng
  while (b[k][j] === b[i][j]) {
    d.push(k * boardSize + j);
    k++;
  }
  k = i - 1;
  while (b[k][j] === b[i][j]) {
    d.push(k * boardSize + j);
    k--;
  }
  if (d.length > 4) return d;
  d = Array();
  h = j;
  // kiểm tra cột
  while (b[i][h] === b[i][j]) {
    d.push(i * boardSize + h);
    h++;
  }
  h = j - 1;
  while (b[i][h] === b[i][j]) {
    d.push(i * boardSize + h);
    h--;
  }
  if (d.length > 4) return d;
  // kiểm tra đường chéo 1
  h = i;
  k = j;
  d = Array();
  while (b[i][j] === b[h][k]) {
    d.push(h * boardSize + k);
    h++;
    k++;
  }
  h = i - 1;
  k = j - 1;
  while (b[i][j] === b[h][k]) {
    d.push(h * boardSize + k);
    h--;
    k--;
  }
  if (d.length > 4) return d;
  // kiểm tra đường chéo 2
  h = i;
  k = j;
  d = Array();
  while (b[i][j] === b[h][k]) {
    d.push(h * boardSize + k);
    h++;
    k--;
  }
  h = i - 1;
  k = j + 1;
  while (b[i][j] === b[h][k]) {
    d.push(h * boardSize + k);
    h--;
    k++;
  }
  if (d.length > 4) return d;
  // nếu không đương chéo nào thỏa mãn thì trả về false.
  return null;
};

//checkWin
const checkWin = async (matchId) => {
  const match = await getMatchByMatchId(matchId);
  if (match) {
    //move= i*boardSize+j
    const { history } = match;
    const b = historyTo2DArray(history);
    const i = Math.floor(history[history.length - 1] / boardSize);
    const j = history[history.length - 1] % boardSize;
    const winRaw = alogithmn(b, i, j);
    if (winRaw) {
      match.winRaw = winRaw;
      if (history.length % 2 === 0) {
        //số chẵn là O=> người chơi 2 win
        match.winner = match.players[1];
        await match.save();
        return { winRaw, winner: match.players[1] };
      } else {
        match.winner = match.players[0]; //ng chơi 1 thắng
        await match.save();
        return { winRaw, winner: match.players[0] };
      }
    }
    return false;
  }
};

module.exports = {
  createMatch,
  getMatchByMatchId,
  getCurrentMatchByIdOfRoom,
  addMove,
  getHistory,
  getHistoryByUserId,
  checkWin,
  // getHistoryByUserId,
};
