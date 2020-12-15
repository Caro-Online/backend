const express = require('express');

const authAdminController = require('../../controllers/admin/auth.controller');

const router = express.Router();

router.post('/login', authAdminController.login);

module.exports = router;
