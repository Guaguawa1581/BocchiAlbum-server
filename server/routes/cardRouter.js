const express = require("express");
const router = express.Router();
const xss = require("xss");
const jwt = require("jsonwebtoken");

// middleware
const { userPassport } = require("../middleware/passport");

// controller
const cardController = require("../controller/cardController");

router.use((req, res, next) => {
  console.log("A request is coming in to get Card Data~");
  next();
});
router.post("/", userPassport, cardController.postData);
router.get("/", cardController.getData);
router.get("/album", userPassport, cardController.getDataAlbum);
router.put("/card_id=:cardId", userPassport, cardController.updateCardData);
router.delete("/card_id=:cardId", userPassport, cardController.deleteCard);

module.exports = router;
