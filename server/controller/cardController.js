const xss = require("xss");
const { v4: uuidv4 } = require("uuid");
// model
const cardModel = require("../model/cardModel");
// some methods
const {
  cardDataValid,
  cardDataUpdateValid
} = require("../middleware/validation");
const handleError = require("../middleware/handleError");
const cloudinaryProxy = require("../model/CloudinaryProxy");

const postData = async (req, res) => {
  try {
    // 檢查輸入參數的格式
    const { error: validError } = cardDataValid(req.body);
    if (validError) return handleError(res, validError.details[0].message, 400);
    const { title, is_public, image_url, public_id } = req.body;

    const userId = req.user[0].user_id;
    const cardId = uuidv4();
    const createdAt = Date.now();
    const cardData = {
      card_id: cardId,
      user_id: userId,
      title,
      is_public,
      image_url,
      public_id,
      created_at: createdAt,
      updated_at: createdAt
    };

    const dbResult = await cardModel.postNew(cardData);
    if (dbResult.error) {
      return handleError(res, dbResult.error);
    } else {
      return res.json({
        success: true,
        message: dbResult.message
      });
    }
  } catch (err) {
    return handleError(res, `後端發生錯誤 ${err}`, 500);
  }
};
// 取得card資料
const getData = async (req, res) => {
  try {
    const { card_id, user_id, is_all, page, limit } = req.query;
    const nowPage = parseInt(page);
    const perPage = parseInt(limit);

    // getData(isAll, userId, cardId,nowPage,perPage);
    const result = await cardModel.getData(
      is_all,
      user_id,
      card_id,
      nowPage,
      perPage
    );

    if (result.error) {
      return handleError(res, result.error);
    } else {
      return res.json({
        success: true,
        message: result.message,
        currentPage: nowPage,
        dataQty: result.dataQty,
        cardData: result.cardData
      });
    }
  } catch (err) {
    return handleError(res, `後端發生錯誤 ${err}`, 500);
  }
};
const getDataAlbum = async (req, res) => {
  try {
    const tokenUserId = req.user[0].user_id;

    const { page, limit } = req.query;
    const nowPage = parseInt(page);
    const perPage = parseInt(limit);

    // getData(isAll, userId, cardId,nowPage,perPage);
    const result = await cardModel.getData(
      true,
      tokenUserId,
      null,
      nowPage,
      perPage
    );
    if (result.error) {
      return handleError(res, result.error);
    } else {
      return res.json({
        success: true,
        message: result.message,
        currentPage: nowPage,
        dataQty: result.dataQty,
        cardData: result.cardData
      });
    }
  } catch (err) {
    return handleError(res, `後端發生錯誤 ${err}`, 500);
  }
};

const updateCardData = async (req, res) => {
  try {
    const tokenUserId = req.user[0].user_id;
    // 檢查輸入參數的格式
    const { error: validError } = cardDataUpdateValid(req.body);
    if (validError) return handleError(res, validError.details[0].message, 400);

    const cardId = req.params.cardId;
    const updated_at = Date.now();
    const cardData = {
      ...req.body,
      updated_at
    };

    // updateData(cardId ,data)
    const result = await cardModel.updateData(cardId, cardData);
    if (result.error) {
      return handleError(res, result.error, 400);
    } else {
      return res.json({
        success: true,
        message: result.message
      });
    }
  } catch (err) {
    return handleError(res, `後端發生錯誤 ${err}`, 500);
  }
};
const deleteCard = async (req, res) => {
  try {
    const { card_id, public_id } = req.query;
    const tokenUserId = req.user[0].user_id;
    const result = await cardModel.delData(card_id);
    if (result.error) {
      return handleError(res, result.error, 400);
    } else {
      // 刪掉cloudinary的圖片
      const delResult = cloudinaryProxy.destroyImg(public_id);

      return res.json({
        success: true,
        message: result.message
      });
    }
  } catch (err) {
    return handleError(res, `後端發生錯誤 ${err}`, 500);
  }
};
module.exports = {
  postData: postData,
  getData: getData,
  getDataAlbum: getDataAlbum,
  updateCardData: updateCardData,
  deleteCard: deleteCard
};
