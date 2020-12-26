const {
  authUserRoute,
  authAdminRoute,
  userRoute,
  roomRoute,
  matchRoute
} = require('../routes');

module.exports = (app) => {
  app.use('/user/auth', authUserRoute);
  app.use('/admin/auth', authAdminRoute);
  app.use('/user', userRoute);
  app.use('/room', roomRoute);
  app.use('/match', matchRoute);
};
