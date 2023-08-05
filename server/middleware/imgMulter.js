const multer = require("multer");
const storage = multer.memoryStorage();
const multerSetting = multer({
  storage: storage,
  limits: {
    fileSize: 5000000
  },
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype !== "image/jpeg" &&
      file.mimetype !== "image/png" &&
      file.mimetype !== "image/jpg" &&
      file.mimetype !== "image/gif"
    ) {
      cb(new Error("上傳的檔案類型不符合規定"));
    } else {
      cb(null, true);
    }
  }
});
const uploadImg = multerSetting.single("image");

module.exports = uploadImg;
