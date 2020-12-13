const httpStatus = require('http-status');

const catchAsync = require('../../utils/catchAsync');
const { userService } = require('../../services');

const getAllUser = catchAsync(async (req, res) => {
  const users = await userService.getAllUser();
  res.status(httpStatus.OK).json({ success: true, users });
});

const updateStatusToOnline = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const user = await userService.getUserById(userId);
  user.isOnline = true;
  await user.save();
  res.status(httpStatus.OK).json({ success: true, user });
});

module.exports = {
  getAllUser,
  updateStatusToOnline,
};