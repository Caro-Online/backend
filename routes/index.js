const authUserRoute = require('./user/auth.route');
const authAdminRoute = require('./admin/auth.route');
const userRoute = require('./user/user.route');
const roomRoute = require('./user/room.route')

module.exports = {
  authUserRoute,
  authAdminRoute,
  userRoute,
  roomRoute
};
