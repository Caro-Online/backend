const express = require('express');

const gameController = require('../../controllers/user/game.controller');

const router = express.Router();

//Lấy danh sách các phòng chơi
router.get('/', gameController.getAllRoom);

//Lấy thông tin phòng chơi
router.get('/:roomId', gameController.getRoom);

//Tạo phòng chơi
router.post('/', gameController.createRoom);
module.exports = router;
