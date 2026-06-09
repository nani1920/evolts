/** @format */

const sendResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({ success: true, message, data });
};

const sendErrorResponse = (res, statusCode, message) => {
  res.status(statusCode).json({ success: false, message });
};

module.exports = { sendResponse, sendErrorResponse };
