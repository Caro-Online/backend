const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');

const { User } = require('../models');
const ApiError = require('../utils/ApiError');

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

const getUserByEmail = (email) => {
  return User.findOne({ email: email });
};

const getUserById = (id) => {
  return User.findById(id);
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
};
