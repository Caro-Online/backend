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

//Tham gia phòng chơi với vai trò ng xem
router.put(
  '/:roomId/join',
  passport.authenticate('jwt', { session: false }),
  roomController.joinRoom
)

//Tham gia phòng chơi với vai trò ng chơi
router.put(
  '/:roomId/join-match',
  passport.authenticate('jwt', { session: false }),
  roomController.joinMatch
)

//TThoát phòng chơi
router.put(
  '/:roomId/out',
  passport.authenticate('jwt', { session: false }),
  roomController.outRoom
)




module.exports = router;
