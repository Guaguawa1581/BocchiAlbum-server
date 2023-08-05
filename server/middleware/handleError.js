module.exports = function handleError(res, error, errCode = 500) {
  return res.status(errCode).json({
    success: false,
    message: error
  });
};
