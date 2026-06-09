/** @format */

const { sendErrorResponse, sendResponse } = require("../../utils/response");

const {
  createBookingService,
  getAllBookingsService,
  getBookingByIdService,
  cancelBookingByIdService,
  updateBookingStatusIdService,
  getAvailableSlotsService,
  getBookingsByStationIdService,
  getBookingsByUserIdService,
} = require("./booking.service");

const createBooking = async (req, res) => {
  try {
    const booking = await createBookingService(req.body, req.user);
    sendResponse(res, 201, "Booking created Successfully", booking);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const slots = await getAvailableSlotsService(
      req.body.date,
      req.body.stationId,
    );
    sendResponse(res, 200, "All Available Slots", slots);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await getAllBookingsService(req.query, req.user);
    sendResponse(res, 200, "All Bookings List", bookings);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await getBookingByIdService(req.params.bookingId, req.user);
    sendResponse(res, 200, `Booking Id: ${booking._id}`, booking);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const updateBookingStatusById = async (req, res) => {
  try {
    const booking = await updateBookingStatusIdService(
      req.params.bookingId,
      req.query.status,
      req.user,
    );
    sendResponse(res, 200, "Booking Updated Successfully", booking);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

// const cancelBookingById = async (req, res) => {
//   try {
//     const booking = await cancelBookingByIdService(req.params);
//     sendResponse(res, 200, "Booking cancelled Successfully");
//   } catch (error) {
//     sendResponse(
//       res,
//       error.statusCode || 500,
//       error.message || "Internal Server Error",
//     );
//   }
// };

// const getAllBookingsByStationId = async (req, res) => {
//   try {
//     const bookings = await getBookingsByStationIdService(req.params);
//     sendResponse(res, 200, "All Bookings", bookings);
//   } catch (error) {
//     sendErrorResponse(
//       res,
//       error.statusCode || 500,
//       error.message || "Internal Server Error",
//     );
//   }
// };

// const getAllBookingsByUserId = async (req, res) => {
//   try {
//     const bookings = await getBookingsByUserIdService(req.params);
//     sendResponse(res, 200, "All Bookings", bookings);
//   } catch (error) {
//     sendErrorResponse(
//       res,
//       error.statusCode || 500,
//       error.message || "Internal Server Error",
//     );
//   }
// };

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatusById,
  getAvailableSlots,
  // cancelBookingById,
  // getAllBookingsByStationId,
  // getAllBookingsByUserId,
};
