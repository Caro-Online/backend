const express = require('express');

const authUserController = require('../controllers/auth-user.controller');

const router = express.Router();

router.post('/register', authUserController.register);
router.post('/login', authUserController.login);
router.post('/login-facebook', authUserController.loginFacebook);
router.post('/login-google', authUserController.loginGoogle);

module.exports = router;
