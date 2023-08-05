const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const sendEmail = async (userEmail, resetToken) => {
  const oauth2Client = new OAuth2(
    process.env.OAUTH2_CLINENTID,
    process.env.OAUTH2_CLINENTSECRET,
    "https://developers.google.com/oauthplayground"
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.OAUTH2_REFRESHTOKEN
  });
  // I don't know why it fuck out.
  // const accessToken = await oauth2Client.getAccessToken();
  // console.log("aaaaa", accessToken);

  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    // #OAuth2 method
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_AC,
      clientId: process.env.OAUTH2_CLINENTID,
      clientSecret: process.env.OAUTH2_CLINENTSECRET,
      refreshToken: process.env.OAUTH2_REFRESHTOKEN,
      accessToken: process.env.OAUTH2_ACCESSTOKEN
    },
    tls: {
      rejectUnauthorized: false
    }

    // #Password method
    // auth: {
    //   user: process.env.GMAIL_AC,
    //   pass: process.env.GMAIL_PW
    // }
  });

  // // mail content
  const mailOptions = {
    from: {
      name: "BocchiAlbum",
      address: process.env.GMAIL_AC //Gmail 帳號
    },
    to: userEmail,
    subject: "Reset PASSWORD of BocchiAlbum",
    text: `To reset your Bocchi Album! password, please click this link: \n\n ${process.env.FRONTEND_WEB}/${resetToken}  \n\n Verification codes will expire after 24 hours.`
  };

  const result = await transport.sendMail(mailOptions);

  return result;
};

module.exports = sendEmail;
