const express = require('express');
const passport = require('passport');
const matchController = require('../../controllers/user/match.controller');

require('../../config/passportJWT.config')(passport);

const router = express.Router();

//Tạo phòng chơi
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    matchController.createMatch
);

module.exports = router;
