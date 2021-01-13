const httpStatus = require("http-status");
const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");

const userService = require("./user.service");
const ApiError = require("../utils/ApiError");
const { compareSync } = require("bcryptjs");

const client = new OAuth2Client(
  "990188398227-bb3t5mt068kdj4350d3mvmqhcqeftkl8.apps.googleusercontent.com"
);

const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  // Nếu mật khẩu không khớp
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Sai email hoặc mật khẩu!");
  }
  //Nếu email chưa xác thực
  if (!user.isEmailVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Email chưa được kích hoạt!");
  }
  //Nếu user bị chặn
  if (user.isBlock) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Tài khoản của bạn đã bị khoá!"
    );
  }
  return user;
};

const verifyAccessTokenFromFacebook = async (userId, accessToken) => {
  let urlGraphFacebook = `https://graph.facebook.com/${userId}?fields=id,name,email,picture&access_token=${accessToken}`;
  const res = await fetch(urlGraphFacebook, {
    method: "GET",
  });
  const response = await res.json();
  return response;
};

const getUserPictureFromFacebook = async (userId) => {
  let urlGetPicture = `https://graph.facebook.com/${userId}/picture`;
  const response = await fetch(urlGetPicture, {
    method: "GET",
  });
  return response.url;
};

const verifyIdTokenFromGoogle = async (idToken) => {
  const response = await client.verifyIdToken({
    idToken,
    audience:
      "1032785897839-f7ki1ppsk1bh0itmj2momm98qo09hcdc.apps.googleusercontent.com",
  });
  return response.payload;
};

module.exports = {
  loginUserWithEmailAndPassword,
  verifyAccessTokenFromFacebook,
  verifyIdTokenFromGoogle,
  getUserPictureFromFacebook,
};
