const socketIo = require('../utils/socketio');
const roomService = require('../services/room.service');
const userService = require('../services/user.service');
const matchService = require('../services/match.service');
const { Chat } = require('../models');

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
    //Message tới các user khác trong phòng
    socket.broadcast.to(user.currentRoom).emit('message', {
      userName: 'admin',
      text: `${user.name} đã tham gia phòng!`,
    });
    //emit người xem đến những người còn lại
    socket.broadcast.to(user.currentRoom).emit('room-data', {
      room,
    });
    // socket.on('audience-out', ({ userId }) => {
    //   socket.broadcast.to(user.currentRoom).emit('audience-out-update', {
    //     userId,
    //   });
    // });
    socket.on('join-players-queue', ({ userId }) => {
      console.log('join-queue');
      socket.broadcast.to(user.currentRoom).emit('room-data', { userId });
    });
    socket.on('match-start', ({ matchId }) => {
      console.log('emit match start update');
      // Emit sự kiện match-start-update để update thông tin match cho các client còn lại trong phòng trừ thằng emit sự kiện match-start

      socket.broadcast
        .to(user.currentRoom)
        .emit('match-start-update', { matchId });
      // Emit sự kiện match-start cho tất cả các client trong phòng để lắng nghe sự kiện receive-move
      io.in(user.currentRoom).emit('match-start', { matchId });
    });
    socket.on('send-move', async ({ matchId }) => {
      // Kiểm tra thắng thua
      const check = await matchService.checkWin(matchId);
      // Lấy match
      const match = await matchService.getMatchByMatchId(matchId);
      if (check) {
        io.in(user.currentRoom).emit('have-winner', { updatedMatch: match });
      } else {
        socket.broadcast
          .to(user.currentRoom)
          .emit('receive-move', { updatedMatch: match });
      }
    });
    socket.on('set-player-ready', async ({ userId }) => {
      console.log("set-player-ready")
      const room = await roomService.getRoomByRoomId(user.currentRoom);
      let isAllReady = true;//tất cả players sẵn sàng = true
      await room.players.forEach((player) => {
        if (player.isReady === false) {
          isAllReady = false;
          return
        }
      })
      if (isAllReady) {//nếu tất cả đã sẵn sàng thì tạo match mới
        console.log("all ready");
        const match = await matchService.createMatch([room.players[0].user, room.players[1].user], room._id);
        io.in(user.currentRoom).emit('match-start-update', { matchId: match._id });
      } else {
        socket.broadcast
          .to(user.currentRoom)
          .emit('update-player-ready', { room })
      }
    });

    socket.on('end-match', async ({ matchId }) => {
      // Lấy match
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
    console.log('In here');
    const user = await userService.getUserById(userId);
    //Lưu lại message
    let room = await roomService.getRoomByRoomId(user.currentRoom);
    let chat = new Chat({ user: user._id, content: message });
    chat = await chat.save();
    room.chat.push(chat);
    room = await room.save();
    console.log(room.chat);
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
