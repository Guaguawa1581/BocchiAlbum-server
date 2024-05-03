const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const path = require("path");
const sharp = require("sharp");
const randomImgName = (bytes = 16) => crypto.randomBytes(bytes).toString("hex");

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_IAM_ACCESS_KEY,
    secretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY
  },
  region: process.env.S3_BUCKET_REGION
});

const uploadImageToS3 = async (file) => {
  let imgExtname = path.extname(file.originalname);
  let imgBuffer = file.buffer;
  let imgMimetype = file.mimetype;
  if (file.mimetype === "image/webp") {
    // 轉換成 .jpeg
    imgBuffer = await sharp(imgBuffer).toFormat("jpeg").toBuffer();
    imgExtname = ".jpg";
    imgMimetype = "image/jpeg";
  }
  const imgKey = randomImgName() + imgExtname;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: imgKey,
    Body: imgBuffer,
    ContentType: imgMimetype
  };

  const command = new PutObjectCommand(params);
  const uploadRes = await s3.send(command);

  return {
    imgKey: imgKey,
    imgUrl: `${process.env.CLOUDFRONT_PATH}/${imgKey}`
  };
};

module.exports = {
  uploadImageToS3: uploadImageToS3
};
