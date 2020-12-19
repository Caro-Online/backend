const httpStatus = require('http-status');
const { default: fetch } = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const catchAsync = require('../../utils/catchAsync');
const {
  authUserService,
  tokenService,
  userService,
  socketService,
} = require('../../services');
const { transporter } = require('../../config/nodemailer.config');

const doLoginStuff = (user) => {
  socketService.emitUserOnline(user._id);
  user.isOnline = true;
  return user.save();
};

const register = catchAsync(async (req, res) => {
  // Tạo email verify token
  const emailVerifyToken = uuidv4();
  // Tạo user
  const user = await userService.createUser({ ...req.body, emailVerifyToken });
  // Gửi email verify
  const mailOptions = {
    from: 'onlinecaroplay@gmail.com',
    to: req.body.email,
    subject: 'Xác nhận email',
    html: `
    <p>Cảm ơn bạn vì đã đăng ký tài khoản trong hệ thống CaroOnline của chúng tôi</p>
    <p>Vui lòng nhấn vào <a href="http://localhost:3000/confirm-registration/${emailVerifyToken}">link</a> sau để xác nhận email</p>
    `,
  };
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log('Lỗi khi gửi mail', err);
    } else {
      console.log('Email đã được gửi!');
    }
  });
  res.status(httpStatus.CREATED).json({ success: true, userId: user._id });
});

const confirmRegistration = catchAsync(async (req, res) => {
  const { emailVerifyToken } = req.params;
  const user = await userService.getUserWithEmailVerifyToken(emailVerifyToken);
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: 'Cannot find user with associated emailVerifyToken',
    });
  } else {
    user.emailVerifyToken = undefined;
    user.isEmailVerified = true;
    user.save();
    return res.status(httpStatus.OK).json({ success: true });
  }
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  let user = await authUserService.loginUserWithEmailAndPassword(
    email,
    password
  );
  const token = await tokenService.generateAuthToken(user);
  user = await doLoginStuff(user);
  res.status(httpStatus.OK).json({
    success: true,
    token: token,
    userId: user._id.toString(),
    userName: user.name,
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
  user = await doLoginStuff(user);
  res.status(httpStatus.OK).json({
    success: true,
    token,
    userId: user._id.toString(),
    userName: user.name,
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
    user = await doLoginStuff(user);
    res.status(httpStatus.OK).json({
      success: true,
      token,
      userId: user._id.toString(),
      userName: user.name,
    });
  }
});

const sendResetPasswordEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  // Tạo unique resetToken
  const resetToken = uuidv4();
  // Tìm user
  const user = await userService.getUserByEmail(email);
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: 'User with associated email not found!',
    });
  } else {
    // Nếu tìm thấy user với email đó
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 36000000; // Sau 1h không đổi mật khẩu sẽ timeout
    await user.save();
    //Send mail
    const mailOptions = {
      from: 'onlinecaroplay@gmail.com',
      to: email,
      subject: 'Đặt lại mật khẩu',
      html: `
      <p>Bạn đã yêu cầu đặt lại mật khẩu.Bấm vào <a href="http://localhost:3000/reset-password/${resetToken}>link</a> này để đặt lại mật khẩu</p>
      `,
    };
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log('Lỗi khi gửi mail', err);
      } else {
        console.log('Email đã được gửi!');
      }
    });
    res.status(httpStatus.OK).json({
      success: true,
    });
  }
});

const getResetPassword = catchAsync(async (req, res) => {
  const { resetToken } = req.params;
  const user = await userService.getUserWithResetToken(resetToken);
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: 'ResetToken not found or has been expired!',
    });
  } else {
    return res
      .status(httpStatus.OK)
      .json({ success: true, userId: user._id.toString() });
  }
});

const postNewPassword = catchAsync(async (req, res) => {
  const { userId, password, resetToken } = req.body;
  let user = await userService.getUserWithResetTokenAndUserId(
    resetToken,
    userId
  );
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: 'ResetToken not found or has been expired!',
    });
  } else {
    user = await userService.updateUserPassword(user, password);
    return res.status(httpStatus.OK).json({ success: true });
  }
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
