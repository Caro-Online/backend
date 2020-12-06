const httpStatus = require('http-status');
const { OAuth2Client } = require('google-auth-library');

const { userService } = require('./index');
const ApiError = require('../utils/ApiError');

const client = new OAuth2Client(
  '990188398227-bb3t5mt068kdj4350d3mvmqhcqeftkl8.apps.googleusercontent.com'
);

const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }
  return user;
};

const verifyAccessTokenFromFacebook = async (userId, accessToken) => {
  let urlGraphFacebook = `https://graph.facebook.com/${userId}?fields=id,name,email&access_token=${accessToken}`;
  const res = await fetch(urlGraphFacebook, {
    method: 'GET',
  });
  const response = await res.json();
  return response;
};

const verifyIdTokenFromGoole = async (idToken) => {
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
  verifyIdTokenFromGoole,
};
