const express = require("express");
const passport = require("passport");

const roomController = require("../../controllers/user/room.controller");

require("../../config/passportJWT.config")(passport);

const router = express.Router();

//Lấy danh sách các phòng chơi
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  roomController.getAllRoom
);

//Lấy thông tin phòng chơi
router.get(
  "/:roomId",
  passport.authenticate("jwt", { session: false }),
  roomController.getRoom
);

// Lấy thông tin chi tiết của room
router.get(
  "/:id/detail",
  passport.authenticate("jwt", { session: false }),
  roomController.getRoomDetail
);

//Tạo phòng chơi
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  roomController.createRoom
);

//Tham gia phòng chơi với vai trò ng xem
router.put(
  "/:roomId/join",
  passport.authenticate("jwt", { session: false }),
  roomController.joinRoom
);

//Tham gia phòng chơi với vai trò ng chơi
router.put(
  "/:roomId/join-player-queue",
  passport.authenticate("jwt", { session: false }),
  roomController.joinPlayerQueue
);

//TThoát phòng chơi
router.put(
  "/:roomId/out",
  passport.authenticate("jwt", { session: false }),
  roomController.outRoom
);

module.exports = router;
