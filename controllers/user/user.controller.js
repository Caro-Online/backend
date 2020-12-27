const httpStatus = require("http-status");

const catchAsync = require("../../utils/catchAsync");
const { userService } = require("../../services");

const getAllUser = catchAsync(async (req, res) => {
  const users = await userService.getAllUser();
  res.status(httpStatus.OK).json({ success: true, users });
});

const getSearch = catchAsync(async (req, res) => {
  const users = await userService.search(req);
  res.status(httpStatus.OK).json({ success: true, users });
});

const getRanking = catchAsync(async (req, res) => {
  const users = await userService.getRanking();
  res.status(httpStatus.OK).json({ success: true, users });
});

const updateStatusToOnline = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  let user = await userService.getUserById(userId);
  user = await userService.updateStatusToOnline(user);
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
  getSearch,
};
