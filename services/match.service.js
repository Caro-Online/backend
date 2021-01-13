const cryptoRandomString = require('crypto-random-string');
const httpStatus = require('http-status');
const moment = require('moment');
const roomService = require('./room.service');
const { Match, Room, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { matchService } = require('.');
const { async } = require('crypto-random-string');

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
const createMatch = async (players, room) => {
  const date = new Date(Date.now() + (room.countdownDuration + 2) * 1000);
  const timeExp = moment.utc(date).format();
  const match = new Match({
    room: room._id,
    players: players,
    history: [],
    winner: null,
    timeExp: timeExp,
  });
  await match.save();
  return Match.populate(match, { path: "players" });
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
    array[i] = Array(boardSize).fill(null);
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
//không chặn 2 đầu
const rule2Check = (b, i, j) => {
  let d = Array();
  let k;
  let h;
  // kiểm tra hàng
  k = i;
  while (b[k][j] === b[i][j]) {
    d.push(k * boardSize + j);
    if (k < boardSize - 1) k++;
    else break;
  }

  if (i > 0) {
    h = i - 1;
    while (b[h][j] === b[i][j]) {
      d.push(h * boardSize + j);
      if (h > 0) h--;
      else break;
    }
  }
  if (d.length > 4) return d;
  d = Array();
  k = j;
  // kiểm tra cột
  while (b[i][k] === b[i][j]) {
    d.push(i * boardSize + h);
    if (k < boardSize - 1) k++;
    else break;
  }

  if (j > 0) {
    h = j - 1;
    while (b[i][h] === b[i][j]) {
      d.push(i * boardSize + h);
      if (h > 0) h--;
      else break;
    }
  }
  if (d.length > 4) return d;
  // kiểm tra đường chéo 1
  h = i;
  k = j;
  d = Array();
  while (b[i][j] === b[h][k]) {
    d.push(h * boardSize + k);
    if (h < boardSize - 1 && k < boardSize - 1) {
      h++;
      k++;
    } else break;
  }
  if (i > 0 && j > 0) {
    h = i - 1;
    k = j - 1;
    while (b[i][j] === b[h][k]) {
      d.push(h * boardSize + k);
      if (h > 0 && k > 0) {
        h--;
        k--;
      } else break
    }
  }
  if (d.length > 4) return d;

  // kiểm tra đường chéo 2
  h = i;
  k = j;
  d = Array();
  while (b[i][j] === b[h][k]) {
    d.push(h * boardSize + k);
    if (h < boardSize - 1 && k > 0) {
      h++;
      k--;
    } else break
  }

  if (i > 0 && j < boardSize - 1) {
    h = i - 1;
    k = j + 1;
    while (b[i][j] === b[h][k]) {
      d.push(h * boardSize + k);
      if (h > 0 && k < boardSize - 1) {
        h--;
        k++;
      } else break;

    }
  }
  if (d.length > 4) return d;
  // nếu không đương chéo nào thỏa mãn thì trả về false.
  return null;
};

//chặn 2 đầu

const rule1Check = (b, i, j) => {
  let d = Array();
  let k;
  let h;
  let op = 0;// số đầu bị chặn
  // kiểm tra hàng
  k = i;
  while (b[k][j] === b[i][j]) {
    d.push(k * boardSize + j);
    if (k < boardSize - 1) k++;
    else break;
  }
  if (b[k][j] !== null || k === boardSize - 1) op++;
  if (i > 0) {
    k = i - 1;
    while (b[k][j] === b[i][j]) {
      d.push(k * boardSize + j);
      if (k > 0) k--;
      else break;
    }
  }
  if (b[k][j] !== null || k === 0) op++;
  if (d.length > 5 || (d.length === 5 && op < 2)) return d;
  d = Array();
  k = j;
  op = 0;
  // kiểm tra cột
  while (b[i][k] === b[i][j]) {
    d.push(i * boardSize + h);
    if (k < boardSize - 1) k++;
    else break;
  }
  if (b[i][k] !== null || k === boardSize - 1) op++;

  if (j > 0) {
    h = j - 1;
    while (b[i][h] === b[i][j]) {
      d.push(i * boardSize + h);
      if (h > 0) h--;
      else break;
    }
  }
  if (b[i][h] !== null || h === 0) op++;
  if (d.length > 5 || (d.length === 5 && op < 2)) return d;
  // kiểm tra đường chéo 1
  h = i;
  k = j;
  d = Array();
  op = 0;
  while (b[i][j] === b[h][k]) {
    d.push(h * boardSize + k);
    if (h < boardSize - 1 && k < boardSize - 1) {
      h++;
      k++;
    } else break;
  }
  if (b[h][k] !== null || h === boardSize - 1 || k === boardSize - 1) op++;
  if (i > 0 && j > 0) {
    h = i - 1;
    k = j - 1;
    while (b[i][j] === b[h][k]) {
      d.push(h * boardSize + k);
      if (h > 0 && k > 0) {
        h--;
        k--;
      } else break
    }
  }
  if (b[h][k] !== null || h === 0 || k === 0) op++;
  if (d.length > 5 || (d.length === 5 && op < 2)) return d;

  // kiểm tra đường chéo 2
  h = i;
  k = j;
  d = Array();
  op = 0;
  while (b[i][j] === b[h][k]) {
    d.push(h * boardSize + k);
    if (h < boardSize - 1 && k > 0) {
      h++;
      k--;
    } else break
  }
  if (b[h][k] !== null || h === boardSize - 1 || k === 0) op++;

  if (i > 0 && j < boardSize - 1) {
    h = i - 1;
    k = j + 1;
    while (b[i][j] === b[h][k]) {
      d.push(h * boardSize + k);
      if (h > 0 && k < boardSize - 1) {
        h--;
        k++;
      } else break;
    }
  }
  if (b[h][k] !== null || h === 0 || k === boardSize - 1) op++;
  if (d.length > 5 || (d.length === 5 && op < 2)) return d;
  // nếu không đương chéo nào thỏa mãn thì trả về false.
  return null;
};

//checkWin
const checkWin = async (updatedMatch, rule) => {
  //const match = await getMatchByMatchId(updatedMatch._id);
  //move= i*boardSize+j
  const { history } = updatedMatch;
  const b = historyTo2DArray(history);
  const i = Math.floor(history[history.length - 1] / boardSize);
  const j = history[history.length - 1] % boardSize;
  //checkwin 
  let winRaw; let winner;
  if (rule) {
    winRaw = rule1Check(b, i, j);
  } else {
    winRaw = rule2Check(b, i, j);
  }
  if (winRaw) {
    if (history.length % 2 === 1) {
      winner = updatedMatch.players[0]._id;

    } else {
      winner = updatedMatch.players[1]._id;
    }
    const cupDataChange = updateUser(winner, updatedMatch.players);
    return { winRaw, winner, cupDataChange }
  }
  return false;
}
const updateFinnishMatch = (winRaw, match) => {
  Room.findOneAndUpdate(
    { _id: match.room },
    {
      $set: {
        'players.$[].isReady': false,
        status: 'WAITING',
      },
    }
  );
  if (history.length % 2 === 1) {
    //số lẻ là X=> người chơi 1 win
    winner = match.players[0]._id;
    const { players } = match
    match.update({
      $set: {
        winRaw: winRaw,
        winner: players[0]._id,
      },
    });
    Promise.all([
      User.findOneAndUpdate(
        { _id: players[0]._id },
        {
          cup: players[0].cup + p1Offer.plusCup,
          matchHavePlayed: players[0].matchHavePlayed + 1,
          matchHaveWon: players[0].matchHaveWon + 1,
        }
      ),
      User.findOneAndUpdate(
        { _id: players[1]._id },
        {
          cup: players[1].cup - p2Offer.subCup,
          matchHavePlayed: players[1].matchHavePlayed + 1,
        }
      ),
    ]);
  } else {
    winner = match.players[1]._id;
    match.update({
      $set: {
        winRaw: winRaw,
        winner: players[1]._id,
      },
    });
    Promise.all([
      User.findOneAndUpdate(
        { _id: players[0]._id },
        {
          cup: players[0].cup - p1Offer.subCup,
          matchHavePlayed: players[0].matchHavePlayed + 1,
        }
      ),
      User.findOneAndUpdate(
        { _id: players[1]._id },
        {
          cup: players[1].cup + p2Offer.plusCup,
          matchHavePlayed: players[1].matchHavePlayed + 1,
          matchHaveWon: players[1].matchHaveWon + 1,
        }
      ),
    ]);
  }
}

const updateUser = (winner, players) => {
  console.log('update cup');
  //Tính số cúp thưởng và phạt theo cúp hiện tại và chênh lệch cup
  const diffCup = players[0].cup - players[1].cup;
  const p1Offer = getCupOffer(players[0].cup, diffCup);
  const p2Offer = getCupOffer(players[1].cup, diffCup);
  console.log(p1Offer);
  console.log(p2Offer);
  console.log(winner);
  if (players[0]._id === winner) {
    return [p1Offer.plusCup, p2Offer.subCup]; //[cúp cộng, cúp trừ]
  } else {
    return [p2Offer.plusCup, p1Offer.subCup]; //[cúp cộng, cúp trừ]
  }
};

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
  match.save();
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
  updateFinnishMatch
  // getHistoryByUserId,
};
