const express = require("express");
const router = express.Router();
const xss = require("xss");
const jwt = require("jsonwebtoken");
const multer = require("multer");
// middleware
const { userPassport } = require("../middleware/passport");
// controller
const imageController = require("../controller/imageController");

router.use((req, res, next) => {
  console.log("A request is coming in to Image Router!");
  next();
});

router.post("/", imageController.postImg);
router.post("/profile", imageController.postProfileImg);



module.exports = router;
