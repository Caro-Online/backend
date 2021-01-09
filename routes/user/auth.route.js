const express = require('express');

const validate = require('../../middlewares/validate.mdw');
const authUserController = require('../../controllers/user/auth.controller');
const authValidation = require('../../validations/auth.validation');

const router = express.Router();

router.post(
  '/register',
  validate(authValidation.register),
  authUserController.register
);

router.get(
  '/confirm-registration/:emailVerifyToken',
  validate(authValidation.confirmRegistration),
  authUserController.confirmRegistration
);

router.post('/login', validate(authValidation.login), authUserController.login);

router.post('/login-facebook', authUserController.loginFacebook);

router.post('/login-google', authUserController.loginGoogle);

router.post(
  '/reset-password',
  validate(authValidation.sendResetPasswordEmail),
  authUserController.sendResetPasswordEmail
);

router.get(
  '/reset-password/:resetToken',
  validate(authValidation.getResetPassword),
  authUserController.getResetPassword
);

router.post(
  '/new-password',
  validate(authValidation.postNewPassword),
  authUserController.postNewPassword
);

module.exports = router;
