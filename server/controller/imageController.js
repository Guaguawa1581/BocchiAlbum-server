const multer = require("multer");
const handleError = require("../middleware/handleError");
const uploadImg = require("../middleware/imgMulter");
const s3Model = require("../model/s3Model");

const postImg = (req, res) => {
  uploadImg(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return handleError(res, err.message, 400);
      } else if (err) {
        return handleError(res, err.message, 400);
      }

      const { imgKey, imgUrl } = await s3Model.uploadImageToS3(req.file);

      return res.json({
        success: true,
        message: "圖片上傳成功",
        imgUrl: imgUrl
      });
    } catch (err) {
      return handleError(res, "文件上傳失敗", 500);
    }
  });
};

module.exports = {
  postImg: postImg
};
