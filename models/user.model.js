const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
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
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyToken: String,
    currentRoom: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      required: true,
      default: 'User',
      enum: ['User', 'Admin'],
    },
    isOnline: {
      type: Boolean,
      required: true,
      default: false,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    resetToken: String,
    resetTokenExpiration: Number,
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
