const httpStatus = require('http-status');

const catchAsync = require('../utils/catchAsync');
const { authService, tokenService, userService } = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).json({ success: true, userId: user._id });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const token = await tokenService.generateAuthToken(user);
  res
    .status(httpStatus.OK)
    .json({ success: true, accessToken: token, userId: user._id.toString() });
});

module.exports = {
  register,
  login,
};
