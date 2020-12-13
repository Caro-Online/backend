const authUserService = require('./auth-user.service');
const authAdminService = require('./auth-admin.service');
const userService = require('./user.service');
const tokenService = require('./token.service');
const socketService = require('./socket.service');
const gameService = require('./game.service');

module.exports = {
  authUserService,
  authAdminService,
  userService,
  tokenService,
  socketService,
  gameService,
};
