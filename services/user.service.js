const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const cryptoRandomString = require('crypto-random-string');

const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenService } = require('../services');

const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const { name, email, password } = userBody;
  const hashPassword = await bcrypt.hash(password, 12);
  const user = new User({
    name,
    email,
    password: hashPassword,
  });
  await user.save();
  return user;
};

const processUserLoginFacebookGoogle = async (name, email) => {
  const user = await getUserByEmail(email);
  if (!user) {
    user = await userService.createUser({
      name,
      email,
      password: cryptoRandomString({ length: 10, type: 'base64' }),
    });
  }
  const token = await tokenService.generateAuthToken(user);
  return { uId: user._id, token };
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

module.exports = {
  createUser,
  getUserByEmail,
  getAdminByEmail,
  getUserById,
  processUserLoginFacebookGoogle,
  getAllUser,
};
