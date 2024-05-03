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
      const result = await cloudinaryProxy.postImg(req.file, "bocchi_imgs");
      const { imgKey, imgUrl, public_id } = result;
      return res.json({
        success: true,
        message: "圖片上傳成功",
        imgUrl,
        imgKey,
        public_id,
        result
      });
    } catch (err) {
      return handleError(res, "文件上傳失敗", 500, err);
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
      const result = await cloudinaryProxy.postImg(req.file, "bocchi_profile");
      const { imgKey, imgUrl, public_id } = result;
      return res.json({
        success: true,
        message: "圖片上傳成功",
        imgUrl,
        imgKey,
        public_id,
        result
      });
    } catch (err) {
      return handleError(res, "文件上傳失敗", 500, err);
    }
  });
};
const delImg = async (req, res) => {
  try {
    const public_id = req.params.public_id;
    const result = await cloudinaryProxy.destroyImg(public_id);
    if (result && result.result == "ok") {
      return res.json({
        success: true,
        message: "圖片刪除成功",
        public_id,
        result
      });
    } else {
      throw new Error(result.result);
    }
  } catch (err) {
    console.log(err);
    return handleError(res, "刪除失敗", 500, err.message);
  }
};

module.exports = {
  postImg,
  postProfileImg,
  delImg
};
