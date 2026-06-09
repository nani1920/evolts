/** @format */

const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAvailableSlots,
  getBookingById,
  updateBookingStatusById,
  getAllBookings,
  // getAllBookingsByStationId,
  // getAllBookingsByUserId,
} = require("./booking.controller");
const {
  createBookingRequest,
  getAvailableSlotsRequest,
  getAllBookingsQuery,
  getBookingByIdParams,
  updateBookingStatusQuery,
} = require("./booking.request");
const {
  validate,
  validateParams,
  validateQuery,
} = require("../../middlewares/validate");

const {
  isAdmin,
  isAuthenticated,
} = require("../../middlewares/auth.middleware");

router.use(isAuthenticated);

router.post("/", validate(createBookingRequest), createBooking);
router.get("/slots", validate(getAvailableSlotsRequest), getAvailableSlots);
router.get("/", validateQuery(getAllBookingsQuery), getAllBookings);
router.get("/:bookingId", validateParams(getBookingByIdParams), getBookingById);
router.patch(
  "/:bookingId",
  validateParams(getBookingByIdParams),
  validateQuery(updateBookingStatusQuery),
  updateBookingStatusById,
);

// router.get("/station/:stationId", getAllBookingsByStationId);
// router.get("/user/:userId", getAllBookingsByUserId);

module.exports = router;
