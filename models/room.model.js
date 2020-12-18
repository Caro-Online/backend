const mongoose = require('mongoose');

const { Schema } = mongoose;

const roomSchema = mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
    },
    name: {
      // Tên phòng
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    user: {
      // Người chơi
      u1: {
        userRef: { type: Schema.Types.ObjectId, ref: 'User' },
        countDownTime: Number,
      },
      u2: {
        userRef: { type: Schema.Types.ObjectId, ref: 'User' },
        countDownTime: Number,
      },
      // u1: { id: Schema.Types.ObjectId, score: Number, countDowntTime: Date }, //Score: Điểm thắng của ván đấu
      // u2: { id: Schema.Types.ObjectId, score: Number, countDowntTime: Date }, //countDownTime: Thời gian chơi còn lại
    },
    audience: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Người xem
    status: {
      // Trạng thái của phòng chơi (Đang chơi, Đang chờ(Có người trong phòng nhưng chua chơi), Trống)
      type: String,
      required: true,
      default: 'WAITING',
      enum: ['PLAYING', 'WAITING'],
    },
    rule: {
      // Luật chơi (Chặn 2 đầu và không chặn 2 đầu)
      type: String,
      required: true,
      default: 'BLOCK_TWO_SIDE',
      enum: ['NOT_BLOCK_TWO_SIDE', 'BLOCK_TWO_SIDE'],
    },
    chat: [
      { user: { type: Schema.Types.ObjectId, ref: 'User' }, content: String },
    ],
    
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
