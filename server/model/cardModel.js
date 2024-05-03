// const dbConnect = require("../middleware/dbConnect");
const dbConnect = require("../middleware/localDb");
const backMeg = (err, meg) => {
  return { error: err, message: meg };
};

const postNew = async (data) => {
  try {
    const {
      card_id,
      user_id,
      title,
      is_public,
      image_url,
      public_id,
      created_at,
      updated_at
    } = data;
    let insertSql =
      "INSERT INTO cards (card_id, user_id, title, is_public, image_url, public_id,  created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ";
    const result = await dbConnect.runSql(insertSql, [
      card_id,
      user_id,
      title,
      is_public,
      image_url,
      public_id,
      created_at,
      updated_at
    ]);
    if (result.affectedRows >= 1) {
      return backMeg(null, `資料新增 ${result.affectedRows}筆`);
    } else {
      return backMeg("無法新增資料", null);
    }
  } catch (error) {
    return backMeg("伺服器發生錯誤", error);
  }
};

const getData = async (isAll = false, userId, cardId, nowPage, perPage) => {
  try {
    let getSql =
      "SELECT c.*, u.username, u.avatar FROM cards AS c INNER JOIN users AS u ON c.user_id = u.user_id ";
    let getParams = [];
    if (cardId) {
      getSql += "WHERE c.card_id = ? ";
      getParams.push(cardId);
    } else {
      getSql += !isAll ? "WHERE is_public=1 " : "";
      if (userId) {
        getSql += "AND c.user_id = ? ";
        getParams.push(userId);
      }
      if (cardId) {
        getSql += "AND c.card_id = ? ";
        getParams.push(cardId);
      }
      getSql += "ORDER BY c.created_at DESC ";
      if (!isNaN(nowPage) && nowPage > 0) {
        getSql += "LIMIT ? OFFSET ? ";
        getParams.push(perPage, (nowPage - 1) * perPage);
      }
    }

    const result = await dbConnect.selectSql(getSql, getParams);
    if (result.length > 0) {
      return {
        message: "已取得資料",
        dataQty: result.length,
        cardData: result
      };
    } else {
      return backMeg("No more information.", null);
    }
  } catch (error) {
    return backMeg("伺服器發生錯誤", error);
  }
};

const updateData = async (cardId, data) => {
  try {
    let putSql = "UPDATE cards SET ";
    let params = [];
    const keys = Object.keys(data);
    keys.forEach((key, index) => {
      putSql += `${key} = ?${index < keys.length - 1 ? ", " : " "}`;
      params.push(data[key]);
    });
    putSql += "WHERE card_id = ?";
    params.push(cardId);

    const result = await dbConnect.runSql(putSql, params);
    if (result.affectedRows >= 1) {
      return backMeg(null, `資料更新 ${result.affectedRows}筆`);
    } else {
      return backMeg("無法更新資料", null);
    }
  } catch (error) {
    return backMeg("伺服器發生錯誤", error);
  }
};
const delData = async (cardId) => {
  try {
    const delSql = "DELETE FROM cards WHERE card_id = ?";
    const result = await dbConnect.runSql(delSql, [cardId]);

    if (result.affectedRows >= 1) {
      return backMeg(null, `資料刪除 ${result.affectedRows}筆`);
    } else {
      return backMeg("無法刪除資料", null);
    }
  } catch (error) {
    return backMeg("伺服器發生錯誤", error);
  }
};
module.exports = {
  postNew,
  getData,
  updateData,
  delData
};
