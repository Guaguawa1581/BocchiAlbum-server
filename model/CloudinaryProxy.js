const cloudinary = require("cloudinary").v2;
const axios = require("axios");
const FormData = require("form-data");
const sharp = require("sharp");
const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_ClOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const getSignature = (folderName = "bocchi_imgs") => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiSecret = cloudinary.config().api_secret;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: folderName,
      upload_preset: uploadPreset
    },
    apiSecret
  );
  return {
    timestamp,
    signature,
    folder: folderName,
    upload_preset: uploadPreset
  };
};

const getDestroySignature = (id) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiSecret = cloudinary.config().api_secret;
  const signature = cloudinary.utils.api_sign_request(
    {
      public_id: id,
      timestamp: timestamp
    },
    apiSecret
  );
  return {
    signature,
    timestamp
  };
};
/** 上傳到圖片到cloudinary
 * @param file 檔案
 * @param folderName: 指定資料夾
 * @returns api res後的資料
 */
const postImg = async (file, folderName) => {
  const apiKey = cloudinary.config().api_key;
  const url = `${process.env.CLOUDINARY_API}/${process.env.CLOUDINARY_ClOUD_NAME}/image/upload`;
  const signData = await getSignature(folderName);

  let tempFile = file;
  if (tempFile.mimetype == "image/webp") {
    tempFile.buffer = await sharp(tempFile.buffer).toFormat("jpeg").toBuffer();
    tempFile.mimetype = "image/jpeg";
    tempFile.originalname = tempFile.originalname.replace(/\.[^/.]+$/, ".jpg");
  }
  const b64 = Buffer.from(tempFile.buffer).toString("base64");
  const dataURI = "data:" + tempFile.mimetype + ";base64," + b64;

  const fd = new FormData();
  fd.append("file", dataURI);
  fd.append("api_key", apiKey);
  fd.append("upload_preset", signData.upload_preset);
  fd.append("timestamp", signData.timestamp);
  fd.append("signature", signData.signature);
  fd.append("folder", folderName);
  try {
    const res = await axios.post(url, fd, {
      header: { ...fd.getHeaders() }
    });
    const imgKey = res.data.asset_id;
    const imgUrl = res.data.secure_url;
    return { ...res.data, imgKey, imgUrl };
  } catch (err) {
    console.error(err);
  }
};
const destroyImg = async (publicID) => {
  const url = `${process.env.CLOUDINARY_API}/${process.env.CLOUDINARY_ClOUD_NAME}/image/destroy`;
  const apiKey = cloudinary.config().api_key;
  const signData = await getDestroySignature(publicID);
  let fd = new FormData();
  fd.append("public_id", publicID);
  fd.append("signature", signData.signature);
  fd.append("api_key", apiKey);
  fd.append("timestamp", signData.timestamp);
  try {
    const res = await axios.post(url, fd, {
      header: { ...fd.getHeaders() }
    });
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  postImg,
  destroyImg
};
