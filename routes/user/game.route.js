const express = require('express');
const passport = require('passport');

const gameController = require('../../controllers/user/game.controller');

require('../../config/passportJWT.config')(passport);

const router = express.Router();

//Lấy danh sách các phòng chơi
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  gameController.getAllRoom
);

//Lấy danh sách các phòng chơi
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  gameController.getAllRoom
);

//Lấy thông tin phòng chơi
router.get(
  '/:roomId',
  passport.authenticate('jwt', { session: false }),
  gameController.getRoom
);

//Tạo phòng chơi
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  gameController.createRoom
);
module.exports = router;
