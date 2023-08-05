const dbConnect = require("../middleware/dbConnect");

const backMeg = (err, meg) => {
  return { error: err, message: meg };
};

const findUser = async (email, resetToken = false) => {
  try {
    let checkSql = "SELECT * FROM users WHERE ";
    let checkParams = [];
    if (email) {
      checkSql += "email = ? ";
      checkParams.push(email);
    } else if (resetToken) {
      checkSql += "reset_token = ? ";
      checkParams.push(resetToken);
    }
    const checkResult = await dbConnect(checkSql, checkParams);

    if (checkResult.length > 0) {
      return {
        isExist: true,
        user: checkResult[0],
        message: "已搜尋到會員資料",
        error: false
      };
    } else {
      return {
        isExist: false,
        user: null,
        message: `${email ? "email" : "Token"} 不存在`,
        error: false
      };
    }
  } catch (error) {
    console.log(error);
    return {
      isExist: false,
      user: null,
      message: "伺服器發生錯誤",
      error: "伺服器發生錯誤"
    };
  }
};
const registerUser = async (data) => {
  try {
    const insertSql = "INSERT INTO users SET ?";
    const result = await dbConnect(insertSql, [data]);

    if (result.affectedRows >= 1) {
      return backMeg(null, `會員資料新增 ${result.affectedRows}筆`);
    } else {
      return backMeg("無法新增會員資料", null);
    }
  } catch (error) {
    return backMeg("伺服器發生錯誤", error);
  }
};

const updateUser = async (userIdOrToken, data, isResetToken = false) => {
  try {
    let updateSql = "UPDATE users SET ? WHERE ";
    isResetToken
      ? (updateSql += "reset_token = ?")
      : (updateSql += "user_id = ?");
    const result = await dbConnect(updateSql, [data, userIdOrToken]);

    if (result.affectedRows >= 1) {
      return backMeg(null, `會員資料更新 ${result.affectedRows}筆`);
    } else {
      return backMeg("無法找到會員資料或更新失敗", null);
    }
  } catch (error) {
    return backMeg("伺服器發生錯誤", error);
  }
};

module.exports = {
  register: registerUser,
  findUser: findUser,
  updateUser: updateUser
};
