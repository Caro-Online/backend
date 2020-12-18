const express = require('express');

const authUserController = require('../../controllers/user/auth.controller');

const router = express.Router();

router.post('/register', authUserController.register);
router.get(
  '/confirm-registration/:emailVerifyToken',
  authUserController.confirmRegistration
);
router.post('/login', authUserController.login);
router.post('/login-facebook', authUserController.loginFacebook);
router.post('/login-google', authUserController.loginGoogle);
router.post('/reset-password', authUserController.sendResetPasswordEmail);
router.get('/reset-password/:resetToken', authUserController.getResetPassword);
router.post('/new-password', authUserController.postNewPassword);

module.exports = router;
