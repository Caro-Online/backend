const express = require('express');
const passport = require('passport');

const auth = require('../../middlewares/auth.mdw');
const validate = require('../../middlewares/validate.mdw');
const matchController = require('../../controllers/user/match.controller');
const matchValidation = require('../../validations/match.validation');
const { ROLES } = require('../../utils/constants');
const { endMatch } = require('../../services/match.service');

require('../../config/passportJWT.config')(passport);

const router = express.Router();

//Tạo phòng chơi
router.post(
  '/',
  auth(ROLES.USER),
  validate(matchValidation.createMatch),
  matchController.createMatch
);

//Lấy danh sách các trận đấu theo query
router.get('/', auth(), matchController.getMatchesHistory);

//Lấy trận hiện tại của id của phòng
router.get(
  '/room/:roomId',
  auth(),
  validate(matchValidation.getCurrentMatchByIdOfRoom),
  matchController.getCurrentMatchByIdOfRoom
);

//Lấy danh sách các trận đấu của user by id
router.get('/user/:userId', auth(), matchController.getMatchesHistoryByUserId);

router.post(
  '/addmove',
  auth(ROLES.USER),
  validate(matchValidation.addMove),
  matchController.addMove
);

router.get(
  '/:matchId',
  auth(),
  validate(matchValidation.getMatchById),
  matchController.getMatchById
);

// Kết thúc ván đấu do hết thời gian
router.put(
  '/:matchId/end-match',
  auth(ROLES.USER),
  validate(matchValidation.endMatch),
  matchController.endMatch
);

module.exports = router;
