const express = require("express");
const router = express.Router();
const xss = require("xss");
const jwt = require("jsonwebtoken");

// middleware
const { userPassport } = require("../middleware/passport");

// controller
const userController = require("../controller/userController");

router.use((req, res, next) => {
  console.log("A request is coming in to userRoute!");
  next();
});

router.post("/", userController.register);
router.put("/", userPassport, userController.updateProfile);
router.post("/login", userController.login);
router.post("/check", userPassport, userController.checkAuth);
router.post("/forgotPassword", userController.forgotPw);
router.get("/resetPassword/:resetToken", userController.checkResetToken);
router.put("/resetPassword", userController.resetPw);
module.exports = router;
