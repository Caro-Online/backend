const socketIo = require('../utils/socketio');
const roomService = require('../services/room.service');
const userService = require('../services/user.service');
const matchService = require('../services/match.service');
const { Chat } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const moment = require('moment');

const emitUserOnline = (userId) => {
  socketIo.getIO().emit('user-online', {
    userId,
  });
};

const emitUserOffline = (userId) => {
  socketIo.getIO().emit('user-offline', {
    userId,
  });
};

const emitRoomData = (room) => {
  socketIo.getIO().to(room.roomId).emit('room-data', {
    room,
  });
};

const emitRoomUpdate = (room) => {
  socketIo.getIO().emit('room-update', {
    room,
  });
};

const emitNewRoom = (room) => {
  socketIo.getIO().emit('new-room', {
    room,
  });
};

const listenToConnectionEvent = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected ' + socket.id);
    const userId = socket.handshake.query.userId;

    //Lắng nghe sự kiện mời tham gia phòng
    listenInvitation(io, socket);

    //Lắng nghe sự kiện join room
    listenToJoinEvent(socket, io);

    //Lắng nghe sự kiện leave room
    listenToLeaveRoomEvent(io, socket);

    //Lắng nghe sự kiện 1 user nào đó online
    listenToUserOnlineEvent(socket);

    //Lắng nghe sự kiện người dùng gửi 1 tin nhắn đến phòng
    listenToSendMessageEvent(io, socket);

    //Lắng nghe sự kiện disconnect (Có thể tắt browser hoặc đăng xuất)
    listenToDisconnectEvent(io, socket, userId);
  });
};
const listenInvitation = (io, socket) => {
  socket.on('invitation', (data) => {
    const invitedId = data ? data.invitedId : null;
    if (invitedId) socket.join(invitedId);
    const receivedId = data ? data.receivedId : null;
    const roomId = data ? data.roomId : null;
    const invitedName = data ? data.invitedName : '';
    const message = `${invitedName} muốn mời bạn tham gia cùng.`;
    console.log(
      'client is subscribing to timer with interval ',
      `invitation_${receivedId}`,
      data
    );
    //Cho user tham gia vào phòng
    // socket.emit(`invitation_${receivedId}`, { roomId, message });
    socket.to(receivedId).emit(`receivedInvitation`, { roomId, message });
  });
};
const listenToJoinEvent = (socket, io) => {
  socket.on('join', async ({ userId, roomId }, callback) => {
    // const { error, user } = addUser({ id: socket.id, name, room });

    let user;
    try {
      //Update phòng user đang ở
      user = await userService.updateCurrentRoom(userId, roomId);
    } catch (error) {
      callback(error);
    }

    //Cho user tham gia vào phòng
    socket.join(roomId);

    //Lấy thông tin về phòng
    const room = await roomService.getRoomByRoomId(roomId);

    //Message tới user đó
    socket.emit('message', {
      userName: 'admin',
      text: `${user.name}, Chào mừng bạn đến với phòng ${room.name}.`,
    });
    //emit người xem đến những người còn lại
    socket.broadcast.to(user.currentRoom).emit('room-data', {
      room,
    });
    //Message tới các user khác trong phòng
    socket.broadcast.to(user.currentRoom).emit('message', {
      userName: 'admin',
      text: `${user.name} đã tham gia phòng!`,
    });
    socket.on('join-players-queue', ({ userId }) => {
      console.log('join-queue');
      socket.broadcast.to(user.currentRoom).emit('room-data', { userId });
    });
    socket.on('check-player-out-during-play', async ({ roomId }) => {
      try {
        let room = await roomService.getRoomById(roomId);
        let updatedPlayers = room.players;
        const player1 = updatedPlayers[0];
        const player2 = updatedPlayers[1];
        console.log(player1.user.currentRoom, player2.user.currentRoom);
        if (player1.user.currentRoom === null) {
          updatedPlayers = updatedPlayers.filter(
            (player) =>
              player.user._id.toString() !== player1.user._id.toString()
          );
        }
        if (player2.user.currentRoom === null) {
          updatedPlayers = updatedPlayers.filter(
            (player) =>
              player.user._id.toString() !== player2.user._id.toString()
          );
        }
        room.players = updatedPlayers;
        room.save();
        // Emit sự kiện cho tất cả các client trong phòng update lại
        io.to(room.roomId).emit('room-data', {
          room: room,
        });
      } catch (err) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.message);
      }
    });
    socket.on('match-start', ({ match }) => {
      console.log('emit match start update');
      // Emit sự kiện match-start-update để update thông tin match cho các client còn lại trong phòng trừ thằng emit sự kiện match-start

      socket.broadcast
        .to(user.currentRoom)
        .emit('match-start-update', { match });
      // // Emit sự kiện match-start cho tất cả các client trong phòng để lắng nghe sự kiện receive-move
      // io.in(user.currentRoom).emit('match-start', { matchId });
    });
    socket.on('send-move', async ({ match, rule }) => {
      // Kiểm tra thắng thua
      const check = await matchService.checkWin(match, rule);
      if (check) {
        console.log(check)
        const date = new Date(Date.now() + (room.countdownDuration + 1) * 1000);
        const timeExp = moment.utc(date).format();
        io.in(user.currentRoom).emit('have-winner', {
          updatedMatch: {
            ...match,
            winner: check.winner,
            winRaw: check.winRaw,
            timeExp: timeExp,
          },
          cupDataChange: check.cupDataChange,
        });
        await matchService.updateFinnishMatch(check.winRaw, match)
      } else {
        socket.broadcast
          .to(user.currentRoom)
          .emit('receive-move', { updatedMatch: match });
      }
    });
    socket.on('set-player-ready', async ({ userId }) => {
      console.log('set-player-ready');
      const room = await roomService.getRoomByRoomId(user.currentRoom);
      let isAllReady = true; //tất cả players sẵn sàng = true
      await room.players.forEach((player) => {
        if (player.isReady === false) {
          isAllReady = false;
          return;
        }
      });
      if (isAllReady) {
        //nếu tất cả đã sẵn sàng thì tạo match mới
        console.log('all ready');
        const match = await matchService.createMatch(
          [room.players[0].user, room.players[1].user],
          room
        );
        io.in(user.currentRoom).emit('match-start-update', {
          //update match
          match: match,
        });
        // io.in(user.currentRoom).emit('match-start', {
        //   //để init lại socket.on
        //   matchId: match._id,
        // });
      } else {
        socket.broadcast
          .to(user.currentRoom)
          .emit('update-player-ready', { room });
      }
    });

    socket.on('end-match', async ({ matchId }) => {
      // Lấy match
      console.log('end-match');
      const match = await matchService.getMatchByMatchId(matchId);
      socket.broadcast
        .to(user.currentRoom)
        .emit('end-match', { updatedMatch: match });
    });

    callback();
  });
};

const listenToUserOnlineEvent = (socket) => {
  socket.on('user-online', async ({ userId }, callback) => {
    const user = await userService.getUserById(userId);
    user.status = 'ONLINE';
    await user.save();
    emitUserOnline(userId);
  });
};

const listenToSendMessageEvent = (io, socket) => {
  socket.on('sendMessage', async ({ message, userId }, callback) => {
    const user = await userService.getUserById(userId);
    //Lưu lại message
    let room = await roomService.getRoomByRoomId(user.currentRoom);
    let chat = new Chat({ user: user._id, content: message });
    chat = await chat.save();
    room.chat.push(chat);
    room = await room.save();
    //Gửi mesage đến tất cả user trong phòng
    io.to(user.currentRoom).emit('message', {
      userId: user._id,
      userName: user.name,
      text: message,
      createdAt: chat.createdAt,
    });

    callback();
  });
};

const listenToDisconnectEvent = (io, socket, userId) => {
  socket.on('disconnect', async (reason) => {
    console.log('Disconnect ' + socket.id);
    let user = await userService.getUserById(userId);

    //Nếu user có ở trong 1 phòng
    if (user.currentRoom) {
      const room = await roomService.outRoom(userId, user.currentRoom);
      socket.leave(user.currentRoom);
      // Thông báo cho các user khác trong phòng rằng user này đã out khỏi phòng
      io.to(user.currentRoom).emit('message', {
        userName: 'admin',
        text: `${user.name} đã rời phòng.`,
      });
      // Thông báo đến tất cả các client để update room bên rooms
      emitRoomUpdate(room);
      // Emit lại thông tin phòng
      io.to(user.currentRoom).emit('roomData', {
        room: room,
      });
      user.currentRoom = null;
    }
    // Đổi status của user thành OFFLINE
    user.status = 'OFFLINE';
    user = await user.save();
    // Emit user-offline
    emitUserOffline(userId);
  });
};

const listenToLeaveRoomEvent = (io, socket) => {
  socket.on('leave-room', async ({ userId }) => {
    console.log('leave room');
    const user = await userService.getUserById(userId);
    const room = await roomService.outRoom(userId, user.currentRoom);
    socket.leave(user.currentRoom);
    // Thông báo message cho các user khác trong phòng rằng user này đã out khỏi phòng
    io.to(user.currentRoom).emit('message', {
      userName: 'admin',
      text: `${user.name} đã rời phòng.`,
    });
    // Thông báo đến tất cả các client để update room bên rooms
    emitRoomUpdate(room);
    // Emit lại thông tin phòng
    io.to(user.currentRoom).emit('room-data', {
      room: room,
    });
    user.currentRoom = null;
    await user.save();
  });
};

module.exports = {
  emitUserOnline,
  emitUserOffline,
  emitRoomUpdate,
  emitNewRoom,
  emitRoomData,
  listenToConnectionEvent,
};
