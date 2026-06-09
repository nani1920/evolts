/** @format */

const createError = (statusCode, message) => {
  return {
    success: false,
    statusCode,
    message,
  };
};

module.exports = {
  createError,
};
