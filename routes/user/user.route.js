const express = require('express');
const passport = require('passport');

const auth = require('../../middlewares/auth.mdw');
const validate = require('../../middlewares/validate.mdw');
const userController = require('../../controllers/user/user.controller');
const userValidation = require('../../validations/user.validation');
const { ROLES } = require('../../utils/constants');

const router = express.Router();

require('../../config/passportJWT.config')(passport);

// Lấy danh sách các user
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validate(userValidation.getAllUser),
  userController.getAllUser
);

//Search User
router.get(
  '/search',
  passport.authenticate('jwt', { session: false }),
  validate(userValidation.getSearch),
  userController.getSearch
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
  auth(ROLES.USER),
  validate(userValidation.updateStatusToOnline),
  userController.updateStatusToOnline
);

router.put(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  validate(userValidation.update),
  userController.update
);

//Lấy thông tin của user theo id
router.get(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  validate(userValidation.getUserById),
  userController.getUserById
);

module.exports = router;
