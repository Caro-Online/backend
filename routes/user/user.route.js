const express = require('express');
const passport = require('passport');

const userController = require('../../controllers/user/user.controller');

const router = express.Router();

require('../../config/passportJWT.config')(passport);

// Lấy danh sách các user
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  userController.getAllUser
);

//Lấy danh sách user được sắp xếp theo cup
router.get(
  '/rank',
  passport.authenticate('jwt', { session: false }),
  userController.getRanking
);

//Update trạng thái của user
router.put(
  '/:userId/update-status',
  passport.authenticate('jwt', { session: false }),
  userController.updateStatusToOnline
);

//Lấy thông tin của user theo id
router.get(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  userController.getUserById
);

module.exports = router;
