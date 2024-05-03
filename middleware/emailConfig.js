const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  try {
    const oauth2Client = new OAuth2(
      process.env.OAUTH2_CLINENTID,
      process.env.OAUTH2_CLINENTSECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.OAUTH2_REFRESHTOKEN
    });

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.log("*ERR: ", err);
          reject(err);
        }
        resolve(token);
      });
    });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_AC,
        accessToken,
        clientId: process.env.OAUTH2_CLINENTID,
        clientSecret: process.env.OAUTH2_CLINENTSECRET,
        refreshToken: process.env.OAUTH2_REFRESHTOKEN
      }
      // #Password method
      // auth: {
      //   user: process.env.GMAIL_AC,
      //   pass: process.env.GMAIL_PW
      // }
    });
    return transporter;
  } catch (err) {
    return err;
  }
};
const sendEmail = async (userEmail, resetToken) => {
  try {
    const mailOptions = {
      from: {
        name: "BocchiAlbum",
        address: process.env.GMAIL_AC //Gmail 帳號
      },
      to: userEmail,
      subject: "Reset PASSWORD of BocchiAlbum",
      text: `To reset your Bocchi Album! password, please click this link: \n\n ${process.env.FRONTEND_WEB}/resetPassword/${resetToken}  \n\n Verification codes will expire after 2 hours.`
    };

    let emailTransporter = await createTransporter();
    const r = await emailTransporter.sendMail(mailOptions);

    return r;
  } catch (err) {
    console.log("ERROR: ", err);
    return err;
  }
};

module.exports = sendEmail;
