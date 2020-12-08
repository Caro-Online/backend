const socketIo = require('../utils/socketio');

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

module.exports = {
  emitUserOnline,
  emitUserOffline,
};
