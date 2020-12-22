const mongoose = require('mongoose');

const { Schema } = mongoose;

const matchSchema = mongoose.Schema(
  {
    // 2 người chơi
    user: {
      u1: {
        userRef: { type: Schema.Types.ObjectId, ref: 'User' },
        countDownTime: Number,
      },
      u2: {
        userRef: { type: Schema.Types.ObjectId, ref: 'User' },
        countDownTime: Number,
      },
    },
    // Kết quả của ván đấu
    result: {
      type: String,
      default: 'HAVE_A_WINNER',
      enum: ['HAVE_A_WINNER', 'DRAW'],
    },
    // Nếu kết quả ván đấu là HAVE_A_WINNER thì có trường này
    winner: { type: Schema.Types.ObjectId, ref: 'User' },
    // Lịch sử ván đấu
    history: [{ x: Number, y: Number }],
    // Nội dung chat của trận đấu
    chat: [
      { user: { type: Schema.Types.ObjectId, ref: 'User' }, content: String },
    ],
  },
  { timestamps: true }
);

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
