const mongoose = require('mongoose');

const { Schema } = mongoose;

const matchSchema = mongoose.Schema(
  {
    // Trường cho biết thuộc về room nào
    room: { type: Schema.Types.ObjectId, ref: 'Room' },
    // 2 người chơi
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // Lịch sử ván đấu
    history: [{ x: Number, y: Number }],
    // Người chiến thắng
    winner: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
