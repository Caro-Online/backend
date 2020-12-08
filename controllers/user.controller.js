const httpStatus = require('http-status');

const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const getAllUser = catchAsync(async (req, res) => {
  const users = await userService.getAllUser();
  res.status(httpStatus.OK).json({ success: true, users });
});

module.exports = {
  getAllUser,
};
