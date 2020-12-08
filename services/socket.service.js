const socketIo = require('../utils/socketio');

const emitUserOnline = (userId) => {
  socketIo.getIO().emit('user-online', {
    userId,
  });
};

module.exports = {
  emitUserOnline,
};
