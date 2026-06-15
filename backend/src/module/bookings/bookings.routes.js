/** @format */

const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAvailableSlots,
  getBookingById,
  updateBookingStatusById,
  getAllBookings,
  verifyBookingOtp,
  // getAllBookingsByStationId,
  // getAllBookingsByUserId,
} = require("./booking.controller");
const {
  createBookingRequest,
  getAvailableSlotsRequest,
  getAllBookingsQuery,
  getBookingByIdParams,
  updateBookingStatusQuery,
  verifyOtpRequest,
} = require("./booking.request");
const {
  validate,
  validateParams,
  validateQuery,
} = require("../../middlewares/validate");

const {
  isAdmin,
  isAuthenticated,
  authorizeRole,
} = require("../../middlewares/auth.middleware");

router.use(isAuthenticated);

router.post("/", validate(createBookingRequest), createBooking);
router.get("/:bookingId", validateParams(getBookingByIdParams), getBookingById);
router.post("/slots", validate(getAvailableSlotsRequest), getAvailableSlots);
router.get("/", validateQuery(getAllBookingsQuery), getAllBookings);
router.patch(
  "/:bookingId",
  validateParams(getBookingByIdParams),
  validateQuery(updateBookingStatusQuery),
  updateBookingStatusById,
);

router.post(
  "/:bookingId/verify-otp",
  authorizeRole("admin", "station_owner"),
  validate(verifyOtpRequest),
  verifyBookingOtp,
);

// router.get("/station/:stationId", getAllBookingsByStationId);
// router.get("/user/:userId", getAllBookingsByUserId);

module.exports = router;
