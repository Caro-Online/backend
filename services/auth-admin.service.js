const httpStatus = require('http-status');

const userService = require('./user.service');
const ApiError = require('../utils/ApiError');

const loginAdminWithEmailAndPassword = async (email, password) => {
  const admin = await userService.getAdminByEmail(email);
  if (!admin || !(await admin.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }
  return admin;
};

module.exports = {
  loginAdminWithEmailAndPassword,
};
