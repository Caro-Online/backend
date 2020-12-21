const httpStatus = require('http-status');

const catchAsync = require('../../utils/catchAsync');
const { userService } = require('../../services');

const getAllUser = catchAsync(async (req, res) => {
  const users = await userService.getAllUser();
  res.status(httpStatus.OK).json({ success: true, users });
});

const getRanking = catchAsync(async (req, res) => {
  console.log('In here');
  const users = await userService.getRanking();
  res.status(httpStatus.OK).json({ success: true, users });
});

const updateStatusToOnline = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const user = await userService.getUserById(userId);
  user.isOnline = true;
  await user.save();
  res.status(httpStatus.OK).json({ success: true, user });
});

const getUserById = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const user = await userService.getUserById(userId);
  res.status(httpStatus.OK).json({ success: true, user });
});

module.exports = {
  getAllUser,
  getRanking,
  updateStatusToOnline,
  getUserById,
};
