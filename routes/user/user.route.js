const express = require('express');

const userController = require('../../controllers/user/user.controller');

const router = express.Router();

router.get('/', userController.getAllUser);
router.put('/:userId/update-status', userController.updateStatusToOnline);

module.exports = router;
