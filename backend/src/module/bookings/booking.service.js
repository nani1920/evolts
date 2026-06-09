/** @format */
const { createError } = require("../../utils/createError");
const mongoose = require("mongoose");
const {
  createBooking,
  getBookingByStartAndEndTime,
  getAllSlots,
  getBookingById,
  getAllBookings,
  updateBookingStatusById,
  getBookingsByUserId,
} = require("./booking.repository");

const { checkCanUpdateStatus } = require("../../utils/helpers");

const { findStationById } = require("../stations/station.repository");
const { findUserById } = require("../users/user.repository");

const createBookingService = async (body, user) => {
  const {
    stationId,
    date,
    startTime: start,
    endTime: end,
    price,
    bookingDate,
    status,
  } = body;

  //Update Later
  // const user = await findUserById(userId);
  // if (!user) {
  //   throw createError(404, "user Not found");
  // }

  const station = await findStationById(stationId);
  if (!station) {
    throw createError(404, "Station Not Found");
  }

  const startTime = new Date(`${date}T${start}:00.000Z`);
  const endTime = new Date(`${date}T${end}:00.000Z`);

  if (startTime > endTime) {
    throw createError(400, "startTime must be less than endTime");
  }
  // console.log(endTime.getHours() - startTime.getHours());
  if (!(endTime.getHours() - startTime.getHours() == 1)) {
    throw createError(400, "The slot time gap should be 1hr only");
  }

  const bookingConflict = await getBookingByStartAndEndTime(
    new mongoose.Types.ObjectId(stationId),
    startTime,
    endTime,
  );

  if (bookingConflict) {
    throw createError(209, "Booking already Exists at this slot Time");
  }

  const updatedBody = {
    userId: user.id,
    stationId,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    price,
    bookingDate: new Date(),
    status: status,
  };

  const booking = await createBooking(updatedBody);
  return booking;
};

const getAllBookingsService = async (options, user) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;

  const filters = {
    ...(options.id && { _id: options.id }),
    ...(options.stationId && { stationId: options.stationId }),
    ...(options.status && { status: options.status }),
    ...(user.role !== "admin" && {
      userId: new mongoose.Types.ObjectId(user.id),
    }),
  };

  // if (options.id) {
  //   filters._id = options.id;
  // }
  // if (options.stationId) {
  //   filters.stationId = options.stationId;
  // }
  // if (options.userId) {
  //   filters.userId = options.userId;
  // }
  // if (options.status) {
  //   filters.status = options.status;
  // }

  console.log(filters);

  const { totalPages, totalItems, bookings } = await getAllBookings(
    filters,
    page,
    limit,
  );

  // if (!bookings || bookings.length === 0) {
  //   throw createError(404, "Bookings Not Found");
  // }
  return { page, limit, totalItems, totalPages, bookings };
};

const getBookingByIdService = async (bookingId, user) => {
  const booking = await getBookingById(bookingId);

  const isOwner = booking.userId.toString() === user.id.toString();
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAdmin) {
    throw createError(
      400,
      "Access restricted: you can check only your bookings.",
    );
  }

  if (!booking || booking.length === 0) {
    throw createError(404, "Booking Not Found");
  }
  return booking;
};

const updateBookingStatusIdService = async (bookingId, status, user) => {
  const bookingExist = await getBookingById(bookingId);
  if (!bookingExist || bookingExist.length === 0) {
    throw createError(404, "Booking Not Found");
  }

  const isOwner = bookingExist.userId.toString() === user.id.toString();
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAdmin) {
    throw createError(
      400,
      "Access restricted: you can update only your bookings.",
    );
  }

  if (bookingExist.status === status) {
    throw createError(400, `Booking is already in '${status}' status`);
  }

  if (!checkCanUpdateStatus(bookingExist.status, status, user.role)) {
    throw createError(
      400,
      `Invalid status transition: ${bookingExist.status} -> ${status}`,
    );
  }

  const booking = await updateBookingStatusById(bookingExist._id, status);
  return booking;
};

const getAvailableSlotsService = async (date, stationId) => {
  const station = await findStationById(stationId);
  if (!station) {
    throw createError(404, "Station Not Found");
  }
  const startTime = new Date(date);
  startTime.setHours(0, 0, 0, 0);
  const endTime = new Date(date);
  endTime.setHours(24, 59, 59, 999);
  const bookings = await getAllSlots(stationId, startTime, endTime);
  const bookedHours = bookings.map((booking) =>
    new Date(booking.startTime).getUTCHours(),
  );

  const availableSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    if (bookedHours.includes(hour)) continue;

    availableSlots.push({
      startTime: `${String(hour).padStart(2, "0")}:00`,
      endTime: `${String(hour + 1).padStart(2, "0")}:00`,
    });
  }

  return { total: availableSlots.length, availableSlots };
};

//need to remove below functions
const cancelBookingByIdService = async () => { };

// const getBookingsByStationIdService = async (params) => {
//   const { stationId } = params;

//   const station = await findStationById(stationId);
//   if (!station) {
//     throw createError(404, "Station Not Found");
//   }
//   const filters = {};
//   filters.stationId = stationId;
//   const bookings = await getAllBookings(filters);
//   if (bookings.length === 0 || !bookings) {
//     throw createError(404, "Bookings Not Found");
//   }
//   return { total: bookings.length, bookings };
// };

// const getBookingsByUserIdService = async (params) => {
//   const { userId } = params;
//   const user = await findUserById(userId);
//   if (!user) {
//     throw createError(404, "User Not Found");
//   }

//   const filters = {};
//   filters.userId = user._id;
//   const bookings = await getAllBookings(filters);
//   if (!bookings || bookings.length === 0) {
//     throw createError(404, "Bookings Not Found");
//   }

//   return { total: bookings.length, bookings };
// };

module.exports = {
  createBookingService,
  getAllBookingsService,
  getBookingByIdService,
  cancelBookingByIdService,
  updateBookingStatusIdService,
  getAvailableSlotsService,
  // getBookingsByStationIdService,
  // getBookingsByUserIdService,
};
