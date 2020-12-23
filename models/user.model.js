const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    // Tên người dùng
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Email người dùng
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    // Mật khẩu người dùng
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            'Password must contain at least one letter and one number'
          );
        }
      },
    },
    // Trường cho biết email đã được kích hoạt chưa
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // Token kích hoạt email
    emailVerifyToken: String,
    // Phòng(Room) hiện tại đang ở
    currentRoom: {
      type: String,
      default: null,
    },
    // Chức vụ(User hoặc Admin)
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    // User có bị block hay không
    isBlock: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Trường cho biết user đang online, offline hoặc playing
    status: {
      type: String,
      required: true,
      default: 'OFFLINE',
      enum: ['ONLINE', 'OFFLINE', 'PLAYING'],
    },
    // Hình đại diện
    imageUrl: {
      type: String,
      trim: true,
    },
    // Token reset mật khẩu
    resetPasswordToken: String,
    // Thời gian token reset mật khẩu hết tác dụng
    resetPasswordTokenExpiration: Number,
    // Số trận đã chơi
    matchHavePlayed: {
      type: Number,
      default: 0,
    },
    // Số trận thắng
    matchHaveWon: {
      type: Number,
      default: 0,
    },
    // Số cúp(Số điểm)
    cup: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

userSchema.statics.isEmailTaken = async function (email) {
  const user = await this.findOne({ email: email });
  return !!user;
};

userSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
