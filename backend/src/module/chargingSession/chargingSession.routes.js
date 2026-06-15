/** @format */

const express = require("express");
const router = express.Router();

const { validateParams } = require("../../middlewares/validate");
const { isAuthenticated } = require("../../middlewares/auth.middleware");
const {
  getSessionByIdRequest,
  startSessionRequest,
  endSessionRequest,
} = require("./chargingSession.request");
const {
  createSession,
  startSession,
  endSession,
  getSessionById,
} = require("./chargingSession.controller");

router.use(isAuthenticated);
//routes
router.post("/create", createSession);
router.post(
  "/:bookingId/start-session",
  validateParams(startSessionRequest),
  startSession,
);
router.post(
  "/:bookingId/end-session",
  validateParams(endSessionRequest),
  endSession,
);
router.get(
  "/:sessionId",
  validateParams(getSessionByIdRequest),
  getSessionById,
);

module.exports = router;
