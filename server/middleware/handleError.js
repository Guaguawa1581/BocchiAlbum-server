module.exports = function handleError(res, error, errCode = 500, ori_err) {
  return res.status(errCode).json({
    success: false,
    message: error,
    ori_msg: ori_err
  });
};
