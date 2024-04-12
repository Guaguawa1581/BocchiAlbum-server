const cloudinary = require('cloudinary').v2;
const handleError = require("../middleware/handleError");
const imgMulter = require("../middleware/imgMulter");
const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_ClOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const getSignature = (folderName = 'bocchi_imgs') => {
  const timestamp = Math.round((new Date).getTime() / 1000);
  const apiSecret = cloudinary.config().api_secret;
  const signature = cloudinary.utils.api_sign_request({
    timestamp: timestamp,
    folder: folderName
  }, apiSecret);
  return { timestamp, signature };
};

const postCardImg = async (file) => {
  const signData = getSignature('bocchi_imgs');
  const result = await postImg(file, signData);
  return result;
};

const postProfileImg = async (file) => {
  const signData = getSignature('bocchi_profile');
  const result = await postImg(file, signData);
  return result;
};

const postImg = async (file, signData) => {
  const apiKey = cloudinary.config().api_key;
  const url = `${process.env.CLOUDINARY_API}/${process.env.CLOUDINARY_ClOUD_NAME}/image/upload`;
  let formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", signData.timestamp);
  formData.append("signature", signData.signature);
  formData.append("folder", signData.folder);

  try {
    const res = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return { key: res.public_id, url: res.url, formData };
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  postCardImg, postProfileImg
};
