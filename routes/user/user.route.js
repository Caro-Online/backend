const express = require("express");
const passport = require("passport");

const userController = require("../../controllers/user/user.controller");

const router = express.Router();

require("../../config/passportJWT.config")(passport);

// Lấy danh sách các user
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  userController.getAllUser
);

//Search User
router.get(
  "/search",
  passport.authenticate("jwt", { session: false }),
  userController.getSearch
);

//Lấy danh sách user được sắp xếp theo cup
router.get(
  "/rank",
  passport.authenticate("jwt", { session: false }),
  userController.getRanking
);

//Update trạng thái của user
router.put(
  "/:userId/update-status",
  passport.authenticate("jwt", { session: false }),
  userController.updateStatusToOnline
);

router.put(
  "/:userId",
  passport.authenticate("jwt", { session: false }),
  userController.update
);

//Lấy thông tin của user theo id
router.get(
  "/:userId",
  passport.authenticate("jwt", { session: false }),
  userController.getUserById
);

module.exports = router;
