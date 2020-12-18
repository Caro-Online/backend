const express = require('express');
const passport = require('passport');

const roomController = require('../../controllers/user/room.controller');

require('../../config/passportJWT.config')(passport);

const router = express.Router();

//Lấy danh sách các phòng chơi
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  roomController.getAllRoom
);

//Lấy danh sách các phòng chơi
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  roomController.getAllRoom
);

//Lấy thông tin phòng chơi
router.get(
  '/:roomId',
  passport.authenticate('jwt', { session: false }),
  roomController.getRoom
);

//Tạo phòng chơi
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  roomController.createRoom
);
module.exports = router;
