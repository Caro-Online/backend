const authUserRoute = require('./user/auth.route');
const authAdminRoute = require('./admin/auth.route');
const userRoute = require('./user/user.route');
const gameRoute = require('./user/game.route')

module.exports = {
  authUserRoute,
  authAdminRoute,
  userRoute,
  gameRoute
};
