const httpStatus = require('http-status');

const catchAsync = require('../utils/catchAsync');
const { authAdminService, tokenService } = require('../services');

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  let admin = await authAdminService.loginAdminWithEmailAndPassword(
    email,
    password
  );
  const token = await tokenService.generateAuthToken(admin);
  res
    .status(httpStatus.OK)
    .json({ success: true, accessToken: token, adminId: admin._id.toString() });
});

module.exports = {
  login,
};
