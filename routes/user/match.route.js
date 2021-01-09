const express = require('express');
const passport = require('passport');

const validate = require('../../middlewares/validate.mdw');
const matchController = require('../../controllers/user/match.controller');
const matchValidation = require('../../validations/match.validation');
const { endMatch } = require('../../services/match.service');

require('../../config/passportJWT.config')(passport);

const router = express.Router();

//Tạo phòng chơi
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validate(matchValidation.createMatch),
  matchController.createMatch
);

//Lấy danh sách các trận đấu theo query
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  matchController.getMatchesHistory
);

//Lấy trận hiện tại của id của phòng
router.get(
  '/room/:roomId',
  passport.authenticate('jwt', { session: false }),
  validate(matchValidation.getCurrentMatchByIdOfRoom),
  matchController.getCurrentMatchByIdOfRoom
);

//Lấy danh sách các trận đấu của user by id
router.get(
  '/user/:userId',
  passport.authenticate('jwt', { session: false }),
  matchController.getMatchesHistoryByUserId
);

router.post(
  '/addmove',
  passport.authenticate('jwt', { session: false }),
  validate(matchValidation.addMove),
  matchController.addMove
);

router.get(
  '/:matchId',
  passport.authenticate('jwt', { session: false }),
  validate(matchValidation.getMatchById),
  matchController.getMatchById
);

// Kết thúc ván đấu do hết thời gian
router.put(
  '/:matchId/end-match',
  passport.authenticate('jwt', { session: false }),
  validate(matchValidation.endMatch),
  matchController.endMatch
);

module.exports = router;
