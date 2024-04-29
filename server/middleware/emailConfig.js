const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const sendEmail = async (userEmail, resetToken) => {
  // const oauth2Client = new OAuth2(
  //   process.env.OAUTH2_CLINENTID,
  //   process.env.OAUTH2_CLINENTSECRET,
  //   "https://developers.google.com/oauthplayground"
  // );
  // const scopes = ["https://mail.google.com"];
  // let result;
  // const url = oauth2Client.generateAuthUrl({
  //   // 'online' (default) or 'offline' (gets refresh_token)
  //   access_type: "offline",

  //   // If you only need one scope you can pass it as a string
  //   scope: scopes
  // });

  // const r = await oauth2Client.getToken(code);
  // console.log("ooooooo", r);
  // oauth2Client.setCredentials(tokens);
  // oauth2Client.on("tokens", (tokens) => {
  //   if (tokens.refresh_token) {
  //     // store the refresh_token in my database!
  //     console.log(tokens.refresh_token);
  //     result.refresh = tokens.refresh_token;
  //   }

  //   console.log(tokens.access_token);
  //   result.refresh = tokens.access_token;
  // });
  // result = { ...result, client: oauth2Client };
  // return result;
  // oauth2Client.setCredentials({
  //   refresh_token: process.env.OAUTH2_REFRESHTOKEN
  // });

  // I don't know why it fuck out.
  // const accessToken = await oauth2Client.getAccessToken();
  // console.log("aaaaa", accessToken);
  // return accessToken;
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    // #OAuth2 method
    // auth: {
    //   type: "OAuth2",
    //   user: process.env.GMAIL_AC,
    //   clientId: process.env.OAUTH2_CLINENTID,
    //   clientSecret: process.env.OAUTH2_CLINENTSECRET,
    //   refreshToken: process.env.OAUTH2_REFRESHTOKEN,
    //   accessToken: process.env.OAUTH2_ACCESSTOKEN
    // },
    // tls: {
    //   rejectUnauthorized: false
    // }

    // #Password method
    auth: {
      user: process.env.GMAIL_AC,
      pass: process.env.GMAIL_PW
    }
  });

  // // mail content
  const mailOptions = {
    from: {
      name: "BocchiAlbum",
      address: process.env.GMAIL_AC //Gmail 帳號
    },
    to: userEmail,
    subject: "Reset PASSWORD of BocchiAlbum",
    text: `To reset your Bocchi Album! password, please click this link: \n\n ${process.env.FRONTEND_WEB}/${resetToken}  \n\n Verification codes will expire after 2 hours.`
  };

  const result = await transport.sendMail(mailOptions);

  return result;
};

module.exports = sendEmail;
