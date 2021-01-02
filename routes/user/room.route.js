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
//Tìm nhanh phòng chơi
router.get(
  '/random',
  passport.authenticate('jwt', { session: false }),
  roomController.getRandomRoom
);

//Lấy thông tin phòng chơi
router.get(
  '/:roomId',
  passport.authenticate('jwt', { session: false }),
  roomController.getRoom
);

// Lấy thông tin chi tiết của room
router.get(
  '/:id/detail',
  passport.authenticate('jwt', { session: false }),
  roomController.getRoomDetail
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
);

//Tham gia phòng chơi với vai trò ng chơi
router.put(
  '/:roomId/join-player-queue',
  passport.authenticate('jwt', { session: false }),
  roomController.joinPlayerQueue
);

//TThoát phòng chơi
router.put(
  '/:roomId/out',
  passport.authenticate('jwt', { session: false }),
  roomController.outRoom
);

//Cập nhật trạng thái của phòng
router.put(
  '/:roomId/update-status',
  passport.authenticate('jwt', { session: false }),
  roomController.updateRoomStatus
);

//Cập nhật trạng thái của người chơi trong room
router.put(
  '/:roomId/update-player-isready',
  passport.authenticate('jwt', { session: false }),
  roomController.updatePlayerIsReady
);

//Cập nhật lại phòng khi người chơi ko sẵn sàng các trận đấu tiếp theo
router.put(
  '/:roomId/player-ready',
  passport.authenticate('jwt', { session: false }),
  roomController.updateRoomWhenPlayerNotReady
);

module.exports = router;
