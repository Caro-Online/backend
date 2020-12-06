const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message);
  }
  next(error);
};

const errorHandler = (err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode).json({ success: false, message: err.message });
};

module.exports = {
  errorConverter,
  errorHandler,
};
