/** @format */

const { sendErrorResponse, sendResponse } = require("../../utils/response");
const {
  createChargingSessionService,
  startChargingSessionService,
  endChargingSessionService,
  getChargingSessionByIdService,
} = require("./chargingSession.service");

const createSession = async (req, res) => {
  try {
    const chargingSession = await createChargingSessionService(req.body);
    sendResponse(res, 201, "charging session created successfully");
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const startSession = async (req, res) => {
  try {
    const chargingSession = await startChargingSessionService(
      req.params.bookingId,
    );
    sendResponse(
      res,
      200,
      "charging session started successfully",
      chargingSession,
    );
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const endSession = async (req, res) => {
  try {
    const chargingSession = await endChargingSessionService(
      req.params.bookingId,
    );
    sendResponse(
      res,
      200,
      "charging session ended successfully",
      chargingSession,
    );
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const getSessionById = async (req, res) => {
  try {
    const chargingSession = await getChargingSessionByIdService(
      req.params.sessionId,
    );
    sendResponse(
      res,
      200,
      `charging session: ${chargingSession._id}`,
      chargingSession,
    );
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};
module.exports = {
  createSession,
  startSession,
  endSession,
  getSessionById,
};
