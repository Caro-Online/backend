const express = require('express');
const passport = require('passport');

const userController = require('../../controllers/user/user.controller');

const router = express.Router();

require('../../config/passportJWT.config')(passport);

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  userController.getAllUser
);
router.put(
  '/:userId/update-status',
  passport.authenticate('jwt', { session: false }),
  userController.updateStatusToOnline
);

router.get(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  userController.getUserById
);

module.exports = router;
