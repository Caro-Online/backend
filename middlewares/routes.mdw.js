const { authUserRoute, authAdminRoute } = require('../routes');

module.exports = (app) => {
  app.use('/user/auth', authUserRoute);
  app.use('/admin/auth', authAdminRoute);
  // app.use('/user', userRoute);
};
