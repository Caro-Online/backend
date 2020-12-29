const express = require("express");
const passport = require("passport");
const matchController = require("../../controllers/user/match.controller");

require("../../config/passportJWT.config")(passport);

const router = express.Router();

//Tạo phòng chơi
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  matchController.createMatch
);
//Lấy trận hiện tại của id của phòng
router.get(
  "/room/:roomId",
  passport.authenticate("jwt", { session: false }),
  matchController.getCurrentMatchByIdOfRoom
);
//Lấy danh sách các trận đấu của user by id
router.get(
  "/user/:userId",
  passport.authenticate("jwt", { session: false }),
  matchController.getMatchesHistoryByUserId
);

router.post(
  "/addmove",
  passport.authenticate("jwt", { session: false }),
  matchController.addMove
);

router.get(
  "/:matchId",
  passport.authenticate("jwt", { session: false }),
  matchController.getMatchById
);

module.exports = router;
