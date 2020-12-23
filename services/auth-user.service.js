const httpStatus = require('http-status');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');

const userService = require('./user.service');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const client = new OAuth2Client(
  '990188398227-bb3t5mt068kdj4350d3mvmqhcqeftkl8.apps.googleusercontent.com'
);

const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  // Nếu mật khẩu không khớp
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Sai email hoặc mật khẩu');
  }

  //Nếu email chưa xác thực
  if (!user.isEmailVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email chưa được kích hoạt');
  }
  return user;
};

const verifyAccessTokenFromFacebook = async (userId, accessToken) => {
  let urlGraphFacebook = `https://graph.facebook.com/${userId}?fields=id,name,email&access_token=${accessToken}`;
  try {
    const res = await fetch(urlGraphFacebook, {
      method: 'GET',
    });
    const response = await res.json();
    return response;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Đã có lỗi xảy ra!');
  }
};

const verifyIdTokenFromGoogle = async (idToken) => {
  const response = await client.verifyIdToken({
    idToken,
    audience:
      '990188398227-bb3t5mt068kdj4350d3mvmqhcqeftkl8.apps.googleusercontent.com',
  });
  return response.payload;
};

module.exports = {
  loginUserWithEmailAndPassword,
  verifyAccessTokenFromFacebook,
  verifyIdTokenFromGoogle,
};
