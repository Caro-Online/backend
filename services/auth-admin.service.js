const httpStatus = require("http-status");

const userService = require("./user.service");
const ApiError = require("../utils/ApiError");

const loginAdminWithEmailAndPassword = async (email, password) => {
  const admin = await userService.getUserByEmail(email, true);
  // Nếu mật khẩu không khớp
  if (!admin || !(await admin.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Sai email hoặc mật khẩu!");
  }
  //Nếu email chưa xác thực
  if (!admin.isEmailVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Email chưa được kích hoạt!");
  }
  return admin;
};
module.exports = {
  loginAdminWithEmailAndPassword,
};
