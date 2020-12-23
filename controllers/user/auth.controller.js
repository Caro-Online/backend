const httpStatus = require('http-status');
const { default: fetch } = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const catchAsync = require('../../utils/catchAsync');
const {
  authUserService,
  tokenService,
  userService,
  socketService,
  mailService,
} = require('../../services');
const { transporter } = require('../../config/nodemailer.config');
const { sendVerifyEmail } = require('../../services/mail.service');

const register = catchAsync(async (req, res) => {
  // Tạo email verify token
  const emailVerifyToken = uuidv4();
  // Tạo user
  await userService.createUser({ ...req.body, emailVerifyToken });
  // Gửi email verify
  mailService.sendVerifyEmail(emailVerifyToken, req.body.email);
  return res.status(httpStatus.OK).json({ success: true });
});

const confirmRegistration = catchAsync(async (req, res) => {
  const { emailVerifyToken } = req.params;
  await userService.processConfirmRegistration(emailVerifyToken);
  return res.status(httpStatus.OK).json({ success: true });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  let user = await authUserService.loginUserWithEmailAndPassword(
    email,
    password
  );
  const token = await tokenService.generateAuthToken(user);
  socketService.emitUserOnline(user._id);
  user = await userService.updateStatusToOnline(user);
  res.status(httpStatus.OK).json({
    success: true,
    token: token,
    user,
  });
});

const loginFacebook = catchAsync(async (req, res) => {
  const { userId, accessToken } = req.body;
  const { name, email } = await authUserService.verifyAccessTokenFromFacebook(
    userId,
    accessToken
  );
  let { user, token } = await userService.processUserLoginFacebookGoogle(
    name,
    email
  );
  socketService.emitUserOnline(user._id);
  user = await userService.updateStatusToOnline(user);
  res.status(httpStatus.OK).json({
    success: true,
    token,
    user,
  });
});

const loginGoogle = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  console.log(req.body);
  const {
    email_verified,
    name,
    email,
  } = await authUserService.verifyIdTokenFromGoogle(idToken);
  if (email_verified) {
    let { user, token } = await userService.processUserLoginFacebookGoogle(
      name,
      email
    );
    socketService.emitUserOnline(user._id);
    user = await userService.updateStatusToOnline(user);
    res.status(httpStatus.OK).json({
      success: true,
      token,
      user,
    });
  }
});

const sendResetPasswordEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  // Tạo unique resetToken
  const resetToken = uuidv4();
  // Tìm user
  const user = await userService.getUserByEmail(email);

  userService.initResetToken(user);

  //Send mail
  mailService.sendResetPasswordEmail(resetToken, email);
  return res.status(httpStatus.OK).json({
    success: true,
  });
});

const getResetPassword = catchAsync(async (req, res) => {
  const { resetToken } = req.params;
  const user = await userService.getUserWithResetToken(resetToken);
  return res
    .status(httpStatus.OK)
    .json({ success: true, userId: user._id.toString() });
});

const postNewPassword = catchAsync(async (req, res) => {
  const { userId, password, resetToken } = req.body;
  let user = await userService.getUserWithResetTokenAndUserId(
    resetToken,
    userId
  );
  user = await userService.updateUserPassword(user, password);
  return res.status(httpStatus.OK).json({ success: true });
});

module.exports = {
  register,
  confirmRegistration,
  login,
  loginFacebook,
  loginGoogle,
  sendResetPasswordEmail,
  getResetPassword,
  postNewPassword,
};
