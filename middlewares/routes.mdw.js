const { authRoute } = require('../routes');

module.exports = (app) => {
  app.use('/auth', authRoute);
  // app.use('/user', userRoute);
};
