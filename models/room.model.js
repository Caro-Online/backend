const mongoose = require('mongoose');

const { Schema } = mongoose;

const roomSchema = mongoose.Schema(
  {
    // Id phòng
    roomId: {
      type: String,
      required: true,
    },
    // Tên phòng
    name: {
      // Tên phòng
      type: String,
      required: true,
    },
    // Mật khẩu phòng
    password: String,
    // Người xem
    audiences: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
      // Trạng thái của phòng chơi (Đang chơi, Đang chờ(Có người trong phòng nhưng chua chơi), Trống)
      type: String,
      required: true,
      default: 'WAITING',
      enum: ['PLAYING', 'WAITING', 'EMPTY'],
    },
    rule: {
      // Luật chơi (Chặn 2 đầu và không chặn 2 đầu)
      // true = Chan 2 dau, false = Khong chan 2 dau
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
