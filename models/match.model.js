const mongoose = require('mongoose');

const { Schema } = mongoose;

const matchSchema = mongoose.Schema(
  {
    // Trường cho biết thuộc về room nào
    room: { type: Schema.Types.ObjectId, ref: 'Room' },
    // 2 người chơi
    players: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    timeExp: Date,
    // Lịch sử ván đấu
    history: [{ type: Number }],
    // Người chiến thắng
    winner: { type: Schema.Types.ObjectId, ref: 'User' },
    winRaw: [{ type: Number }],
    xIsNext: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
