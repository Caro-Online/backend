const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { ObjectId } = mongoose.Types

const userSchema = mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            trim: true,
        },
        user: {
            u1: { id: ObjectId, score: Number, countDowntTime: Date },//Score: Điểm thắng của ván đấu
            u2: { id: ObjectId, score: Number, countDowntTime: Date }//countDownTime: Thời gian chơi còn lại
        },
        chat: [{ userId: ObjectId, content: String, date: Date }],
        history: [{ x: Number, y: Number }],
    },
    { timestamps: true }
);

const Game = mongoose.model('Game', userSchema);

module.exports = Game;
