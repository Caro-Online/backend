const express = require('express');
const passport = require('passport');

const auth = require('../../middlewares/auth.mdw');
const validate = require('../../middlewares/validate.mdw');
const roomController = require('../../controllers/user/room.controller');
const roomValidation = require('../../validations/room.validation');
const { ROLES } = require('../../utils/constants');

require('../../config/passportJWT.config')(passport);

const router = express.Router();

//Lấy danh sách các phòng chơi
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  roomController.getAllRoom
);

//Tìm nhanh phòng chơi
router.get(
  '/random',
  passport.authenticate('jwt', { session: false }),
  auth(ROLES.USER),
  roomController.getRandomRoom
);

//Lấy thông tin phòng chơi
router.get(
  '/:roomId',
  passport.authenticate('jwt', { session: false }),
  validate(roomValidation.getRoom),
  roomController.getRoom
);

// Lấy thông tin chi tiết của room
router.get(
  '/:id/detail',
  passport.authenticate('jwt', { session: false }),
  validate(roomValidation.getRoomDetail),
  roomController.getRoomDetail
);

//Tạo phòng chơi
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  auth(ROLES.USER),
  validate(roomValidation.createRoom),
  roomController.createRoom
);

//Tham gia phòng chơi với vai trò ng xem
router.put(
  '/:roomId/join',
  passport.authenticate('jwt', { session: false }),
  auth(ROLES.USER),
  validate(roomValidation.joinRoom),
  roomController.joinRoom
);

//Tham gia phòng chơi với vai trò ng chơi
router.put(
  '/:roomId/join-player-queue',
  passport.authenticate('jwt', { session: false }),
  auth(ROLES.USER),
  validate(roomValidation.joinPlayerQueue),
  roomController.joinPlayerQueue
);

//TThoát phòng chơi
router.put(
  '/:roomId/out',
  passport.authenticate('jwt', { session: false }),
  auth(ROLES.USER),
  validate(roomValidation.outRoom),
  roomController.outRoom
);

//Cập nhật trạng thái của phòng
router.put(
  '/:roomId/update-status',
  passport.authenticate('jwt', { session: false }),
  auth(ROLES.USER),
  validate(roomValidation.updateRoomStatus),
  roomController.updateRoomStatus
);

//Cập nhật trạng thái của người chơi trong room
router.put(
  '/:roomId/update-player-isready',
  passport.authenticate('jwt', { session: false }),
  auth(ROLES.USER),
  validate(roomValidation.updatePlayerIsReady),
  roomController.updatePlayerIsReady
);

//Cập nhật lại phòng khi người chơi ko sẵn sàng các trận đấu tiếp theo
router.put(
  '/:roomId/player-ready',
  passport.authenticate('jwt', { session: false }),
  auth(ROLES.USER),
  validate(roomValidation.updateRoomWhenPlayerNotReady),
  roomController.updateRoomWhenPlayerNotReady
);

module.exports = router;
