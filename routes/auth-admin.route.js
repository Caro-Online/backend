const express = require('express');

const authController = require('../controllers/auth-user.controller');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/signin/google', authController.loginGoogle);
router.post('/signin/facebook', authController.loginFacebook);


module.exports = router;