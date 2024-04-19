const bcrypt = require("bcryptjs");
const xss = require("xss");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// model
const userModel = require("../model/userModel");
//  methods
const {
  registerValid,
  loginValid,
  updateProfileValid,
  emailValid,
  resetPwValid
} = require("../middleware/validation");
const handleError = require("../middleware/handleError");
const sendEmail = require("../middleware/emailConfig");

const registerFn = async (req, res) => {
  try {
    // 檢查傳入格式
    const { error: validError } = registerValid(req.body);
    if (validError) return handleError(res, validError.details[0].message, 400);

    const { email, password, username, avatar } = req.body;
    // 檢查email是否已經存在
    const checkEmail = await userModel.findUser(email);
    if (checkEmail.isExist) return handleError(res, "該Email已使用", 409);

    // 密碼加密、避免圖片連結xss
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const filterAvatar = xss(avatar);
    // 生成使用者ID
    const userId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const createdAt = Date.now();

    const userData = {
      user_id: userId,
      email,
      password: hashedPassword,
      username,
      avatar: filterAvatar,
      created_at: createdAt
    };
    const regiResult = await userModel.register(userData);
    if (regiResult.error) {
      return handleError(res, regiResult.error);
    } else {
      return res.json({
        success: true,
        message: regiResult.message
      });
    }
  } catch (err) {
    return handleError(res, `後端發生錯誤 ${err}`, 500);
  }
};

const loginFn = async (req, res) => {
  try {
    // 檢查輸入參數的格式
    const { error: validError } = loginValid(req.body);
    if (validError) return handleError(res, validError.details[0].message, 400);

    const { email, password } = req.body;
    // 檢查email是否已經存在
    const findResult = await userModel.findUser(email);
    if (!findResult.isExist || findResult.error)
      return handleError(res, "email或密碼錯誤", 401);

    const matchUser = findResult.user;

    // 驗證密碼
    const isMatch = await bcrypt.compare(password, matchUser.password);
    if (isMatch) {
      //密碼正確
      // 製作token
      const expDate = Date.now() + 1000 * 60 * 60 * 24 * 7;
      const tokenObj = {
        userId: matchUser.user_id,
        email: matchUser.email,
        exp: expDate
      };
      const token = jwt.sign(tokenObj, process.env.PASSPORT_SECRET);

      return res.status(200).json({
        success: true,
        message: `Authenticated as ${matchUser.email}`,
        user: {
          user_id: matchUser.user_id,
          avatar: matchUser.avatar,
          email: matchUser.email,
          username: matchUser.username
        },
        token: "JWT " + token,
        exp: expDate
      });
    } else {
      return handleError(res, "email或密碼錯誤", 401);
    }
  } catch (err) {
    return handleError(res, `後端發生錯誤 ${err}`, 500);
  }
};

const checkAuth = async (req, res) => {
  try {
    return res.status(200).send({
      success: true,
      message: `Token 沒有問題`,
      user: {
        user_id: req.user[0].user_id,
        avatar: req.user[0].avatar,
        email: req.user[0].email,
        username: req.user[0].username,
        created_at: req.user[0].created_at
      }
    });
  } catch (err) {
    return handleError(res, `後端發生錯誤 ${err}`, 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    // 檢查傳入格式
    const { error: validError } = updateProfileValid(
      req.body,
      req.body.isChangePassword
    );
    if (validError) return handleError(res, validError.details[0].message, 400);
    const {
      new_password: newPassword,
      username,
      avatar,
      isChangePassword
    } = req.body;

    const userId = req.user[0].user_id;
    const filterAvatar = xss(avatar);

    let userData = {};
    if (isChangePassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      userData = {
        username,
        avatar: filterAvatar,
        password: hashedPassword
      };
    } else {
      userData = {
        username,
        avatar: filterAvatar
      };
    }

    console.log("ujuu", userId, userData);
    const updateResult = await userModel.updateUser(userId, userData);
    if (updateResult.error) {
      return handleError(res, updateResult.error);
    } else {
      return res.json({
        success: true,
        message: updateResult.message
      });
    }
  } catch (err) {
    return handleError(res, `後端發生錯誤 ${err}`, 500);
  }
};

const forgotPw = async (req, res) => {
  try {
    // 檢查輸入參數的格式
    const { error: validError } = emailValid(req.body);
    if (validError) return handleError(res, validError.details[0].message, 400);

    const userEmail = req.body.email;
    // 檢查email是否已經存在
    const findResult = await userModel.findUser(userEmail);
    if (!findResult.isExist && !findResult.error) {
      return handleError(res, "No account found with this email.", 200);
    } else if (!findResult.isExist && findResult.error) {
      return handleError(res, res.err, 401);
    }

    const matchUserId = findResult.user.user_id;
    const resetToken = uuidv4();
    const tokenTime = Date.now() + 1000 * 60 * 60 * 2;

    const resetTokenObj = {
      reset_token: resetToken,
      reset_token_exp: tokenTime
    };

    const updateResult = await userModel.updateUser(matchUserId, resetTokenObj);
    if (updateResult.error) {
      return handleError(res, updateResult.error);
    }

    const sendMailResult = await sendEmail(userEmail, resetToken);

    if (sendMailResult) {
      return res.json({
        success: true,
        message: "郵件已成功發送！",
        messageId: sendMailResult.messageId
      });
    }
  } catch (err) {
    return handleError(res, `郵件發送失敗： ${err}`, 500);
  }
};

const checkResetToken = async (req, res) => {
  try {
    const resetToken = req.params.resetToken;
    const findResult = await userModel.findUser(null, resetToken);

    //比對token
    if (!findResult.isExist && !findResult.error) {
      return handleError(res, "No account found with this token.", 404);
    } else if (!findResult.isExist && findResult.error) {
      return handleError(res, res.err, 401);
    }
    //比較時間
    const matchUser = findResult.user;
    if (Date.now() > matchUser.reset_token_exp) {
      return handleError(res, "The verification code has expired.", 200);
    } else {
      return res.status(200).json({
        success: true,
        message: `Information obtained`,
        user: {
          user_id: matchUser.user_id,
          avatar: matchUser.avatar,
          email: matchUser.email,
          username: matchUser.username,
          reset_token: matchUser.reset_token,
          reset_token_exp: matchUser.reset_token_exp
        }
      });
    }
  } catch (err) {
    return handleError(res, `後端發生錯誤 ${err}`, 500);
  }
};
const resetPw = async (req, res) => {
  try {
    // 檢查輸入參數的格式
    const { error: validError } = resetPwValid(req.body);
    if (validError) return handleError(res, validError.details[0].message, 400);

    const { reset_token: nowResetToken, new_password: newPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const userData = {
      password: hashedPassword,
      reset_token: null,
      reset_token_exp: null
    };
    const updateResult = await userModel.updateUser(
      nowResetToken,
      userData,
      true
    );
    if (updateResult.error) {
      return handleError(res, updateResult.error);
    } else {
      return res.json({
        success: true,
        message: "Reset Password Success"
      });
    }
  } catch (err) {
    return handleError(res, `後端發生錯誤 ${err}`, 500);
  }
};
module.exports = {
  register: registerFn,
  login: loginFn,
  checkAuth: checkAuth,
  updateProfile: updateProfile,
  forgotPw: forgotPw,
  checkResetToken: checkResetToken,
  resetPw: resetPw
};
