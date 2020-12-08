const httpStatus = require('http-status');

const catchAsync = require('../utils/catchAsync');
const {
  authUserService,
  tokenService,
  userService,
  socketService,
} = require('../services');
const { default: fetch } = require('node-fetch');

const doLoginStuff = (user) => {
  socketService.emitUserOnline(user._id);
  user.isOnline = true;
  return user.save();
};

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).json({ success: true, userId: user._id });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  let user = await authUserService.loginUserWithEmailAndPassword(
    email,
    password
  );
  const token = await tokenService.generateAuthToken(user);
  user = await doLoginStuff(user);
  res
    .status(httpStatus.OK)
    .json({ success: true, accessToken: token, userId: user._id.toString() });
});

const loginFacebook = catchAsync(async (req, res) => {
  const { userId, accessToken } = req.body;
  const { name, email } = await authUserService.verifyAccessTokenFromFacebook(
    userId,
    accessToken
  );
  const { uId, token } = await userService.processUserLoginFacebookGoogle(
    name,
    email
  );
  res.status(httpStatus.OK).json({
    success: true,
    token,
    userId: uId.toString(),
  });
});

const loginGoogle = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  const {
    email_verified,
    name,
    email,
  } = await authUserService.verifyIdTokenFromGoole(idToken);
  if (email_verified) {
    const { uId, token } = await userService.processUserLoginFacebookGoogle(
      name,
      email
    );
    res.status(httpStatus.OK).json({
      success: true,
      token,
      userId: uId.toString(),
    });
  }
});

module.exports = {
  register,
  login,
  loginFacebook,
  loginGoogle,
};
