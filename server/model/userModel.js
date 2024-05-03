// const dbConnect = require("../middleware/dbConnect");
const dbConnect = require("../middleware/localDb");

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
    const checkResult = await dbConnect.selectSql(checkSql, checkParams);
    if (checkResult.length > 0) {
      console.log("已搜尋到會員資料");
      return {
        isExist: true,
        user: checkResult[0],
        message: "已搜尋到會員資料",
        error: false
      };
    } else {
      console.log(`${email ? "email" : "Token"} 不存在`);
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
    const { user_id, email, password, username, avatar, created_at } = data;
    const insertSql =
      "INSERT INTO users (user_id, email, password, username, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?)";

    const result = await dbConnect.runSql(insertSql, [
      user_id,
      email,
      password,
      username,
      avatar,
      created_at
    ]);
    console.log(result);
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
    console.log(userIdOrToken, data);
    let updateSql = "UPDATE users SET ";
    let params = [];
    // const { username, avatar, password } = data;
    const keys = Object.keys(data); // 獲取所有鍵的數組
    keys.forEach((key, index) => {
      // 只在非最後一個元素後添加逗號
      updateSql += `${key} = ?${index < keys.length - 1 ? ", " : " "}`;
      params.push(data[key]);
    });

    updateSql += "WHERE ";
    isResetToken
      ? (updateSql += "reset_token = ?")
      : (updateSql += "user_id = ?");
    params.push(userIdOrToken);
    const result = await dbConnect.runSql(updateSql, params);

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
