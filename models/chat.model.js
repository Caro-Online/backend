const mongoose = require('mongoose');

const { Schema } = mongoose;

const chatSchema = mongoose.Schema(
  {
    // Thuộc về user nào
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    // Nội dung chat
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
