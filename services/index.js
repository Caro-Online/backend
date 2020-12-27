const authUserService = require('./auth-user.service');
const authAdminService = require('./auth-admin.service');
const userService = require('./user.service');
const tokenService = require('./token.service');
const socketService = require('./socket.service');
const roomService = require('./room.service');
const mailService = require('./mail.service');
const matchService = require('./match.service');

module.exports = {
  authUserService,
  authAdminService,
  userService,
  tokenService,
  socketService,
  roomService,
  mailService,
  matchService
};
