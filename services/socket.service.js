const socketIo = require('../utils/socketio');
const roomService = require('../services/room.service');
const userService = require('../services/user.service');

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

const listenToConnectionEvent = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected ' + socket.id);
    const userId = socket.handshake.query.userId;

    //Lắng nghe sự kiện join room
    listenToJoinEvent(socket);

    //Lắng nghe sự kiện 1 user nào đó offline
    listenToUserOfflineEvent(socket);

    //Lắng nghe sự kiện người dùng gửi 1 tin nhắn đến phòng
    listenToSendMessageEvent(io, socket);

    //Lắng nghe sự kiện disconnect (Có thể tắt browser hoặc đăng xuất)
    listenToDisconnectEvent(io, socket, userId);
  });
};

const listenToJoinEvent = (socket) => {
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
    //Truyền roomData xuống client
    // io.to(user.room).emit('roomData', {
    //   room: user.room,
    //   users: getUsersInRoom(user.room),
    // });

    console.log('userId' + userId);
    //emit người xem đến những người còn lại
    socket.broadcast.to(user.currentRoom).emit('new-audience', {
      userId,
    });
    socket.on('audience-out', ({ userId }, callback) => {
      socket.broadcast.to(user.currentRoom).emit('audience-out-update', {
        userId,
      });
      callback();
    })
    callback();
  });
};

const listenToUserOfflineEvent = (socket) => {
  socket.on('user-online', async ({ userId }, callback) => {
    const user = await userService.getUserById(userId);
    user.isOnline = true;
    await user.save();
    emitUserOnline(userId);
  });
};

const listenToSendMessageEvent = (io, socket) => {
  socket.on('sendMessage', async ({ message, userId }, callback) => {
    const user = await userService.getUserById(userId);
    //Lưu lại message
    const room = await roomService.getRoomByRoomId(user.currentRoom);
    room.chat.push({ user: user._id, content: message });
    await room.save();
    //Gửi mesage đến tất cả user trong phòng
    io.to(user.currentRoom).emit('message', {
      userId: user._id,
      userName: user.name,
      text: message,
    });

    callback();
  });
};

const listenToDisconnectEvent = (io, socket, userId) => {
  socket.on('disconnect', async (reason) => {
    console.log('Disconnect ' + socket.id);
    console.log(reason);
    let user = await userService.getUserById(userId);

    //Nếu user có ở trong 1 phòng
    if (user.currentRoom) {
      // Thông báo cho các user khác trong phòng rằng user này đã out khỏi phòng
      io.to(user.currentRoom).emit('message', {
        userName: 'admin',
        text: `${user.name} đã rời phòng.`,
      });
      // Emit lại thông tin phòng
      const room = await roomService.getRoomByRoomId(user.currentRoom);
      io.to(user.currentRoom).emit('roomData', {
        room: room,
      });
      user.currentRoom = null;
    }
    // Đổi isOnline của user thành false
    user.isOnline = false;
    user = await user.save();
    // Emit user-offline
    console.log(user);
    emitUserOffline(userId);
  });
};

module.exports = {
  emitUserOnline,
  emitUserOffline,
  listenToConnectionEvent,
};
