const httpStatus = require('http-status');

const { userService } = require('./index');
const ApiError = require('../utils/ApiError');

const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if(!user || !(await user.isPasswordMatch(password))){
    throw new ApiError(httpStatus.UNAUTHORIZED,'Invalid email or password');
  }
  return user;
};

module.exports = {
  loginUserWithEmailAndPassword,
};
