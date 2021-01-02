const cryptoRandomString = require("crypto-random-string");
const httpStatus = require("http-status");
const moment = require("moment");
const roomService = require("./room.service");

const { Match, Room } = require("../models");
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
const createMatch = (players, IdOfRoom) => {
  const date = new Date(Date.now() + 20 * 1000);
  const timeExp = moment.utc(date).format();
  const match = new Match({
    room: IdOfRoom,
    players: players,
    history: [],
    winner: null,
    timeExp: timeExp,
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
  })
    .sort({ createdAt: -1 })
    .populate("room");
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
  const date = new Date(Date.now() + 20 * 1000);
  const timeExp = moment.utc(date).format();
  const update = {
    $push: {
      history: index,
    },
    xIsNext: xIsNext,
    timeExp,
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
      //cập nhật trạng thái isReady=false cho 2 user
      await Room.findOneAndUpdate(
        { _id: match.room },
        {
          $set: {
            "players.$[].isReady": false,
            status: "WAITING",
          },
        }
      );
      //cập nhật win raw và winner
      if (history.length % 2 === 1) {
        //số lẻ là X=> người chơi 1 win
        await match.update({
          $set: {
            winRaw: winRaw,
            winner: match.players[0],
          },
        });
        return { winRaw, winner: match.players[0] };
      } else {
        await match.update({
          $set: {
            winRaw: winRaw,
            winner: match.players[1],
          },
        });
        return { winRaw, winner: match.players[1] };
      }
    }
    return false;
  }
};

const endMatch = async (matchId, loserId) => {
  const match = await getMatchByMatchId(matchId);
  // Tìm ra người chiến thắng
  const winnerId = match.players.filter(
    (player) => player._id.toString() !== loserId.toString()
  )[0];
  // Set winner
  match.winner = winnerId;
  // Reset timeExp
  match.timeExp = undefined;
  match.save();
  return match;
};

module.exports = {
  createMatch,
  getMatchByMatchId,
  getCurrentMatchByIdOfRoom,
  addMove,
  getHistory,
  getHistoryByUserId,
  checkWin,
  endMatch,
  // getHistoryByUserId,
};
