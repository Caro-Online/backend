const cryptoRandomString = require('crypto-random-string');
const httpStatus = require('http-status');
const moment = require('moment');
const roomService = require('./room.service');
const { Match, Room, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { matchService } = require('.');

const getMatchByMatchId = async (matchId) => {
  const match = await Match.findById(matchId).populate('players');
  if (!match) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Không thể tìm thấy trận tương ứng!'
    );
  }
  return match;
};
//roomId: _id
const createMatch = (players, room) => {
  const date = new Date(Date.now() + room.countdownDuration * 1000);
  const timeExp = moment.utc(date).format();
  const match = new Match({
    room: room._id,
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
  console.log('roomId: ' + roomId);
  const match = await Match.find({ room: roomId })
    .sort({ createdAt: -1 })
    .limit(1)
    .populate('players');
  return match;
};

const getHistoryByUserId = (userId) => {
  console.log('getHistoryByUserId', userId);
  const match = Match.find({
    players: {
      $in: userId,
    },
  })
    .sort({ createdAt: -1 })
    .populate('room');
  return match;
};
const getHistory = (data) => {
  console.log('getHistory', data);
  const match = Match.find({
    room: data.roomId,
  })
    .sort({ createdAt: -1 })
    .populate('players');
  return match;
};
//thêm 1 bước đi vào lich sử
const addMove = (matchId, index, xIsNext, room) => {
  const filter = { _id: matchId };
  const date = new Date(Date.now() + room.countdownDuration * 1000);
  const timeExp = moment.utc(date).format();
  const update = {
    $push: {
      history: index,
    },
    xIsNext: xIsNext,
    timeExp,
  };
  return Match.findOneAndUpdate(filter, update, { new: true }).populate('room');
};
const boardSize = 17;

const create2DArray = () => {
  let array = Array(boardSize);
  for (let i = 0; i < boardSize; i++) {
    array[i] = Array(boardSize).fill('null');
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
    array[i][j] = h % 2 === 0 ? 'X' : 'O';
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
const checkWin = async (matchId, updatedMatch) => {
  const match = await getMatchByMatchId(matchId);
  //move= i*boardSize+j
  const { history } = updatedMatch;
  const b = historyTo2DArray(history);
  const i = Math.floor(history[history.length - 1] / boardSize);
  const j = history[history.length - 1] % boardSize;
  const winRaw = alogithmn(b, i, j);
  let cupDataChange;
  if (winRaw) {
    //cập nhật trạng thái isReady=false cho 2 user
    await Room.findOneAndUpdate(
      { _id: updatedMatch.room },
      {
        $set: {
          'players.$[].isReady': false,
          status: 'WAITING',
        },
      }
    );
    let winner;
    let cupDataChange;
    //cập nhật win raw và winner
    if (history.length % 2 === 1) {
      //số lẻ là X=> người chơi 1 win
      winner = updatedMatch.players[0]._id;
      await match.update({
        $set: {
          winRaw: winRaw,
          winner: updatedMatch.players[0]._id,
        },
      });
      cupDataChange = await updateUser(winner, updatedMatch.players);
      return { winRaw, winner, cupDataChange };
    } else {
      winner = updatedMatch.players[1]._id;
      await match.update({
        $set: {
          winRaw: winRaw,
          winner: updatedMatch.players[1]._id,
        },
      });
      cupDataChange = await updateUser(winner, updatedMatch.players);
      return { winRaw, winner, cupDataChange };
    }
  }

  return false;
};

const updateUser = async (winner, players) => {
  console.log('update cup');
  //Tính số cúp thưởng và phạt theo cúp hiện tại và chênh lệch cup
  const diffCup = players[0].cup - players[1].cup;
  const p1Offer = await getCupOffer(players[0].cup, diffCup);
  const p2Offer = await getCupOffer(players[1].cup, diffCup);
  console.log(p1Offer);
  console.log(p2Offer);
  console.log(winner);
  if (players[0]._id === winner) {
    await Promise.all([
      User.findOneAndUpdate({ _id: players[0]._id }, {
        cup: players[0].cup + p1Offer.plusCup,
        matchHavePlayed: players[0].matchHavePlayed + 1,
        matchHaveWon: players[0].matchHaveWon + 1
      }),
      User.findOneAndUpdate({ _id: players[1]._id }, {
        cup: players[1].cup - p2Offer.subCup,
        matchHavePlayed: players[1].matchHavePlayed + 1,
      })
    ])
    return [p1Offer.plusCup, p2Offer.subCup]//[cúp cộng, cúp trừ]
  } else {
    await Promise.all([
      User.findOneAndUpdate({ _id: players[0]._id }, {
        cup: players[0].cup - p1Offer.subCup,
        matchHavePlayed: players[0].matchHavePlayed + 1
      }),
      User.findOneAndUpdate({ _id: players[1]._id }, {
        cup: players[1].cup + p2Offer.plusCup,
        matchHavePlayed: players[1].matchHavePlayed + 1,
        matchHaveWon: players[1].matchHaveWon + 1
      })
    ])
    return [p2Offer.plusCup, p1Offer.subCup];//[cúp cộng, cúp trừ]
  }

}

const endMatch = async (matchId, loserId) => {
  const match = await getMatchByMatchId(matchId);
  // Tìm ra người chiến thắng
  const winner = match.players.filter(
    (player) => player._id.toString() !== loserId.toString()
  )[0];
  // Set winner
  match.winner = winner._id;
  // Reset timeExp
  const date = new Date(Date.now() + 20 * 1000);
  match.timeExp = moment.utc(date).format();
  await match.save();
  const cupDataChange = await updateUser(winner._id, match.players);
  return { match, cupDataChange };
  //udpate cup,matchhavewin,matchplayed
};

const getCupOffer = (currentCup, differenceCup) => {
  let plusCup = 20;
  let subCup = 20;
  const differenceLevel = Math.floor(differenceCup / 100);
  if (Math.abs(differenceLevel) < 5) {
    //xét lệch dưới 4 cấp
    //Thưởng Giảm 2 cúp nếu hơn 1 level, tăng 2 cúp nếu thua 1 level
    plusCup -= differenceLevel * 2;
    //Phạt Tăng 2 cúp nếu hơn 1 level, giảm 2 cúp nếu thua 1 level
    subCup += differenceLevel * 2;
  } else {
    //lệch trên 4 cấp
    if (differenceLevel < 0) {
      //nếu hơn cúp
      plusCup = 10;
      subCup = 30;
    } else if (differenceLevel < 0) {
      //nếu thua cúp
      plusCup = 30;
      subCup = 10;
    }
  }
  //Thưởng và phạt theo chế độ dưới 100 cúp
  if (currentCup < 100) {
    plusCup += 5;
    subCup = Math.floor(currentCup / 10);
  }
  return { plusCup, subCup };
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
