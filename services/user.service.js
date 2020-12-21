const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const cryptoRandomString = require('crypto-random-string');
const { v4: uuidv4 } = require('uuid');

const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const tokenService = require('./token.service');

const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email đã có người sử dụng');
  }
  const { password } = userBody;

  const hashPassword = await bcrypt.hash(password, 12);
  const user = new User({
    ...userBody,
    password: hashPassword,
  });
  await user.save();
  return user;
};

const updateUserPassword = async (user, password) => {
  const hashPassword = await bcrypt.hash(password, 12);
  user.password = hashPassword;
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  return await user.save();
};

const processUserLoginFacebookGoogle = async (name, email) => {
  let user = await getUserByEmail(email);
  if (!user) {
    user = await createUser({
      name,
      email,
      password: cryptoRandomString({ length: 10, type: 'base64' }),
    });
  }
  const token = await tokenService.generateAuthToken(user);
  return { user, token };
};

const getUserByEmail = (email) => {
  return User.findOne({ email: email, role: 'User' });
};

const getAdminByEmail = (email) => {
  return User.findOne({ email: email, role: 'Admin' });
};

const getUserById = (id) => {
  return User.findById(id);
};

const getAllUser = () => {
  return User.find();
};

const getRanking = () => {
  return User.find({}).sort({cup:-1});
};

const getUserWithResetToken = (resetToken) => {
  return User.findOne({
    resetToken,
    resetTokenExpiration: { $gt: Date.now() },
  });
};

const getUserWithEmailVerifyToken = (emailVerifyToken) => {
  return User.findOne({
    emailVerifyToken,
  });
};

const getUserWithResetTokenAndUserId = (resetToken, userId) => {
  return User.findOne({
    resetToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  });
};

const updateCurrentRoom = async (userId, roomId) => {
  const user = await getUserById(userId);
  user.currentRoom = roomId;
  return await user.save();
};

module.exports = {
  createUser,
  getUserByEmail,
  getAdminByEmail,
  getUserById,
  getRanking,
  processUserLoginFacebookGoogle,
  getAllUser,
  getUserWithResetToken,
  getUserWithResetTokenAndUserId,
  getUserWithEmailVerifyToken,
  updateCurrentRoom,
  updateUserPassword,
};
