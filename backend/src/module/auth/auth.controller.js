/** @format */

const { registerUser, loginUser } = require("./auth.service");
const { sendResponse, sendErrorResponse } = require("../../utils/response");

const register = async (req, res) => {
  try {
    const response = await registerUser(req.body);

    return sendResponse(res, 201, "user created successfully", response);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const login = async (req, res) => {
  try {
    const response = await loginUser(req.body);

    return sendResponse(res, 200, "user loggedin successfully", response);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

module.exports = {
  register,
  login,
};
