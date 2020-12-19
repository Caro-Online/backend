//3rd party library
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const httpStatus = require('http-status');
const passport = require('passport');

const { errorConverter, errorHandler } = require('./middlewares/error.mdw');
const ApiError = require('./utils/ApiError');
const { User } = require('./models');
const { socketService, roomService, userService } = require('./services');
require('dotenv').config();
const app = express();

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

require('./middlewares/routes.mdw')(app);

// 404 error for unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Route not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.y0eny.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log('Connect Mongodb Successfully');
    const server = app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });

    const io = require('./utils/socketio').init(server);
    io.on('connection', (socket) => {
      console.log('Client connected ' + socket.id);
      const userId = socket.handshake.query.userId;

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

        callback();
      });

      socket.on('user-online', async ({ userId }, callback) => {
        const user = await userService.getUserById(userId);
        user.isOnline = true;
        await user.save();
        socketService.emitUserOnline(userId);
      });

      //Khi người dùng gửi message
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
        socketService.emitUserOffline(userId);
      });
    });
  })
  .catch((error) => console.log(error));
