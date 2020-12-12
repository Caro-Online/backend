const { authUserRoute, authAdminRoute, userRoute, gameRoute, } = require('../routes');

module.exports = (app) => {
  app.use('/user/auth', authUserRoute);
  app.use('/admin/auth', authAdminRoute);
  app.use('/user', userRoute);
  app.use('/user', gameRoute);
};
