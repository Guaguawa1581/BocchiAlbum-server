const multer = require("multer");
const handleError = require("../middleware/handleError");
const uploadImg = require("../middleware/imgMulter");
const s3Model = require("../model/s3Model");
const cloudinaryProxy = require("../model/CloudinaryProxy");

const postImg = (req, res) => {
  // 檢查格式
  uploadImg(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return handleError(res, err.message, 400);
      } else if (err) {
        return handleError(res, err.message, 400);
      }
      // const { imgKey, imgUrl } = await s3Model.uploadImageToS3(req.file);
      const { imgKey, imgUrl } = await cloudinaryProxy.postImg(req.file, 'bocchi_imgs');
      return res.json({
        success: true,
        message: "圖片上傳成功",
        imgUrl,
        imgKey
      });
    } catch (err) {
      return handleError(res, "文件上傳失敗", 500);
    }
  });
};
const postProfileImg = (req, res) => {
  // 檢查格式
  uploadImg(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return handleError(res, err.message, 400);
      } else if (err) {
        return handleError(res, err.message, 400);
      }
      // const { imgKey, imgUrl } = await s3Model.uploadImageToS3(req.file);
      const { imgKey, imgUrl } = await cloudinaryProxy.postImg(req.file, 'bocchi_profile');
      return res.json({
        success: true,
        message: "圖片上傳成功",
        imgUrl,
        imgKey
      });
    } catch (err) {
      return handleError(res, "文件上傳失敗", 500);
    }
  });
};


module.exports = {
  postImg: postImg,
  postProfileImg,
};
