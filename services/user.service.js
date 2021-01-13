const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const cryptoRandomString = require("crypto-random-string");
const { v4: uuidv4 } = require("uuid");

const { User } = require("../models");
const ApiError = require("../utils/ApiError");
const tokenService = require("./token.service");

const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email đã có người sử dụng");
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

const processUserLoginFacebookGoogle = async (name, email, imageUrl) => {
  let user = await User.findOne(
    { email: email, isAdmin: false },
    { __v: 0, password: 0 }
  );
  if (!user) {
    user = await createUser({
      name,
      email,
      password: cryptoRandomString({ length: 10, type: "base64" }),
      imageUrl,
    });
  }
  const token = await tokenService.generateAuthToken(user);
  return { user, token };
};

const getUserByEmail = async (email, isAdmin = false) => {
  const user = await User.findOne({ email: email, isAdmin }, { __v: 0 });
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Không thể tìm thấy user tương ứng!"
    );
  }
  return user;
};

const getAdminByEmail = (email) => {
  return User.findOne({ email: email, role: "Admin" });
};

const getUserById = async (id) => {
  const user = await User.findById(id, { __v: 0, password: 0 });
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Không thể tìm thấy user tương ứng!"
    );
  }
  return user;
};

const getAllUser = async (req) => {
  // console.log("search", req);
  let keyword = " ";
  let filters = {};
  const query = req.query;
  if (query && query.keyword) {
    keyword = query.keyword;
    filters = {
      $or: [
        {
          name: {
            $regex: keyword,
            $options: "mi",
          },
        },
        {
          email: {
            $regex: keyword,
            $options: "mi",
          },
        },
        {
          phone: {
            $regex: keyword,
            $options: "mi",
          },
        },
      ],
    };
  }
  const users = await User.find(filters, { __v: 0, password: 0 });
  return users;
};

const search = async (req) => {
  // console.log("search", req);
  let keyword = "";
  const query = req.query;
  if (query) {
    keyword = query.keyword;
  }
  const filters = {
    $or: [
      {
        name: {
          $regex: keyword,
          $options: "mi",
        },
      },
      {
        email: {
          $regex: keyword,
          $options: "mi",
        },
      },
      {
        phone: {
          $regex: keyword,
          $options: "mi",
        },
      },
    ],
  };

  const users = await User.find(filters, { __v: 0, password: 0 });

  return users;
};

const getRanking = async () => {
  const users = await User.find({}, { __v: 0, password: 0 }).sort({
    cup: -1,
  });
  if (!users || users.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Không thể tìm thấy user nào!");
  }
  return users;
};

const getUserWithResetToken = async (resetToken) => {
  const user = await User.findOne(
    {
      resetPasswordToken: resetToken,
      resetPasswordTokenExpiration: { $gt: Date.now() },
    },
    { __v: 0, password: 0 }
  );
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Không thể tìm thấy user tương ứng!"
    );
  }
  return user;
};

const processConfirmRegistration = async (emailVerifyToken) => {
  const user = await User.findOne({
    emailVerifyToken,
  });
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Không thể tìm thấy user tương ứng!"
    );
  }
  user.emailVerifyToken = undefined;
  user.isEmailVerified = true;
  user.save();
  return user;
};

const getUserWithResetTokenAndUserId = async (resetToken, userId) => {
  const user = await User.findOne(
    {
      resetPasswordToken: resetToken,
      resetPasswordTokenExpiration: { $gt: Date.now() },
      _id: userId,
    },
    { __v: 0, password: 0 }
  );
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Không thể tìm thấy user tương ứng hoặc resetToken đã hết hạn!"
    );
  }
  return user;
};

const updateCurrentRoom = async (userId, roomId) => {
  const user = await getUserById(userId);
  user.currentRoom = roomId;
  return await user.save();
};

const updateStatusToOnline = (user) => {
  user.status = "ONLINE";
  return user.save();
};
const update = (user) => {
  return user.save();
};

const initResetToken = (user, resetToken) => {
  user.resetPasswordToken = resetToken;
  user.resetPasswordTokenExpiration = Date.now() + 5 * 36000000; // Sau 5h không đổi mật khẩu sẽ timeout
  return user.save();
};

module.exports = {
  update,
  createUser,
  getUserByEmail,
  getAdminByEmail,
  getUserById,
  getRanking,
  processUserLoginFacebookGoogle,
  getAllUser,
  getUserWithResetToken,
  getUserWithResetTokenAndUserId,
  processConfirmRegistration,
  updateCurrentRoom,
  updateUserPassword,
  updateStatusToOnline,
  initResetToken,
  search,
};
