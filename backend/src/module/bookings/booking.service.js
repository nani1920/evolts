/** @format */
const { createError } = require("../../utils/createError");
const _ = require("lodash");
const mongoose = require("mongoose");
const {
  createBooking,
  getBookingByStartAndEndTime,
  getAllSlots,
  getBookingById,
  getAllBookings,
  updateBookingById,
  getBookingsByUserId,
} = require("./booking.repository");
const {
  createChargingSession,
  findChargingSession,
} = require("../chargingSession/chargingSession.repository");

const {
  checkCanUpdateStatus,
  generateOTP,
  generateStartAndEndTime,
} = require("../../utils/helpers");

const { findStationById } = require("../stations/station.repository");
const { findUserById } = require("../users/user.repository");
const { findChargerById } = require("../chargers/chargers.repository");

const validateBookingTime = (date, start, end, station) => {
  const { startTime, endTime } = generateStartAndEndTime(date, start, end);
  if (startTime < new Date()) {
    throw createError(400, "Booking Time cannot be in past");
  }

  const { startTime: stationOpenTime, endTime: stationCloseTime } =
    generateStartAndEndTime(date, station.openTime, station.closeTime);

  if (startTime < stationOpenTime || endTime > stationCloseTime) {
    throw createError(400, "booking timings are out of station hours");
  }
  if (startTime > endTime) {
    throw createError(400, "startTime must be less than endTime");
  }
  // console.log(endTime.getHours() - startTime.getHours());
  const diff = (endTime - startTime) / (1000 * 60 * 60); // 1000=>ms, 60=>seconds,60=>hours
  if (diff !== 1) {
    throw createError(400, "The slot time gap should be 1hr only");
  }

  return { startTime, endTime };
};
const resolveUserId = (user, body) => {
  if (user.role !== "admin" && user.role !== "station_owner") {
    return user.id;
  } else {
    if (!body.userId) {
      throw createError(400, "Invalid userId, plz provide userId in req");
    }
    return new mongoose.Types.ObjectId(body.userId);
  }
};
const validateHasBookingAuthority = (booking, user) => {
  const isUsersBooking = booking.userId.toString() === user.id.toString();
  const hasHighAuthority =
    user.role === "admin" || user.role === "station_owner";
  if (!isUsersBooking && !hasHighAuthority) {
    throw createError(
      403,
      "Access restricted: you can check only your bookings.",
    );
  }
};
const getBookingFilters = (options, user) => {
  let filters = {};
  let timings;
  if (options.date) {
    timings = generateStartAndEndTime(
      options.date,
      options.startTime,
      options.endTime,
    );
  }

  const match = {
    ...(options.id && { _id: options.id }),
    ...(options.stationId && {
      stationId: new mongoose.Types.ObjectId(options.stationId),
    }),
    ...(options.status && { status: options.status }),
    ...(user.role === "user" && { userId: resolveUserId(user, options) }),
    ...(options.isVerified &&
      user.role !== "user" && { isVerified: options.isVerified === "true" }),
    ...(options.date && {
      startTime: { $gte: timings.startTime },
      endTime: { $lte: timings.endTime },
    }),
  };
  const lookup = [
    {
      from: "users",
      let: { userId: "$userId" },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$_id", "$$userId"],
            },
          },
        },
        {
          $project: { _id: 1, username: 1, phoneNumber: 1 },
        },
      ],
      as: "user",
    },
    {
      from: "chargers",
      let: { chargerId: "$chargerId" },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$_id", "$$chargerId"],
            },
          },
        },
        {
          $project: {
            _id: 1,
            chargerNo: 1,
            connectorType: 1,
            powerKw: 1,
            pricingPerKwh: 1,
          },
        },
      ],
      as: "charger",
    },
    {
      from: "stations",
      let: { stationId: "$stationId" },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$_id", "$$stationId"],
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            address: 1,
            location: 1,
            pricing: 1,
          },
        },
      ],
      as: "station",
    },
  ];
  const project = {
    chargerId: 0,
    stationId: 0,
    userId: 0,
    otp: 0,
    __v: 0,
  };
  const addFields = {
    user: { $arrayElemAt: ["$user", 0] },
    charger: { $arrayElemAt: ["$charger", 0] },
    station: { $arrayElemAt: ["$station", 0] },
  };
  filters["match"] = match;
  filters["lookup"] = lookup;
  filters["project"] = project;
  filters["addFields"] = addFields;

  return filters;
};

//Service Routes
const createBookingService = async (body, user) => {
  const {
    stationId,
    chargerId,
    date,
    startTime: start,
    endTime: end,
    price,
    bookingDate,
    status,
  } = body;

  const userId = resolveUserId(user, body);

  const userExist = await findUserById(userId);
  if (!userExist) {
    throw createError(404, "user Not found");
  }
  const station = await findStationById(stationId);
  if (!station) {
    throw createError(404, "Station Not Found");
  }
  const charger = await findChargerById(chargerId);
  if (!charger) {
    throw createError(404, "charger Not Found");
  }
  if (charger.stationId.toString() !== station._id.toString()) {
    throw createError(400, "charger doesn't belongs to this station");
  }

  const { startTime, endTime } = validateBookingTime(date, start, end, station);

  const bookingConflict = await getBookingByStartAndEndTime(
    charger._id,
    startTime,
    endTime,
  );

  if (bookingConflict) {
    throw createError(409, "Booking already Exists at this slot Time");
  }

  const updatedBody = {
    userId: userExist._id,
    stationId: station._id,
    chargerId: charger._id,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
  };

  let booking = await createBooking(updatedBody);

  booking = _.omit(booking.toObject(), ["otp", "isVerified"]);
  return booking;
};

const getAllBookingsService = async (options, user) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;

  const filters = getBookingFilters(options, user);

  const { totalPages, totalItems, bookings } = await getAllBookings(
    filters,
    page,
    limit,
  );

  // if (!bookings || bookings.length === 0) {
  //   throw createError(404, "Bookings Not Found");
  // }
  return {
    page,
    limit,
    totalItems,
    totalPages,
    bookings: bookings.length > 0 ? bookings : "bookings not found",
  };
};

const getBookingByIdService = async (bookingId, user) => {
  const populate = [
    {
      path: "chargerId",
      select: "_id chargerNo connectorType status powerKw pricingPerKwh",
    },
    {
      path: "stationId",
      select: "-ownerId -__v",
    },
    {
      path: "userId",
      select: "_id username phoneNumber email",
    },
  ];

  let booking = await getBookingById(bookingId, populate);
  validateHasBookingAuthority(booking, user);

  if (!booking || booking.length === 0) {
    throw createError(404, "Booking Not Found");
  }
  // booking = _.omit(booking.toObject(), ["isVerified"]);
  if (booking.status === "booked") {
    booking = _.omit(booking, ["otp", "isVerified"]);
  }
  return booking;
};

const updateBookingStatusIdService = async (bookingId, status, user) => {
  const bookingExist = await getBookingById(bookingId);
  if (!bookingExist || bookingExist.length === 0) {
    throw createError(404, "Booking Not Found");
  }

  validateHasBookingAuthority(bookingExist, user);

  if (bookingExist.status === status) {
    throw createError(400, `Booking is already in '${status}' status`);
  }

  if (!checkCanUpdateStatus(bookingExist.status, status, user.role)) {
    throw createError(
      400,
      `Invalid status transition: ${bookingExist.status} -> ${status}`,
    );
  }

  const otp = generateOTP();

  const booking = await updateBookingById(bookingExist._id, { status, otp });
  return booking;
};

// const getAvailableSlotsService = async (date, stationId) => {
//   const station = await findStationById(stationId);
//   if (!station) {
//     throw createError(404, "Station Not Found");
//   }
//   const startTime = new Date(date);
//   startTime.setHours(0, 0, 0, 0);
//   const endTime = new Date(date);
//   endTime.setHours(24, 59, 59, 999);
//   const bookings = await getAllSlots(stationId, startTime, endTime);
//   const bookedHours = bookings.map((booking) =>
//     new Date(booking.startTime).getUTCHours(),
//   );

//   const availableSlots = [];
//   for (let hour = 0; hour < 24; hour++) {
//     if (bookedHours.includes(hour)) continue;

//     availableSlots.push({
//       startTime: `${String(hour).padStart(2, "0")}:00`,
//       endTime: `${String(hour + 1).padStart(2, "0")}:00`,
//     });
//   }

//   return { total: availableSlots.length, availableSlots };
// };

const verifyBookingOtpService = async (data, bookingId) => {
  const { otp } = data;
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw createError(404, "Booking Not Found");
  }

  if (booking.status === "booked") {
    throw createError(400, "user must arrive the station");
  }

  const [sessionExists] = await findChargingSession({
    bookingId: booking._id,
  });

  if (booking.isVerified && sessionExists) {
    throw createError(400, "booking already verified");
  }

  if (otp !== booking.otp) {
    throw createError(400, "please enter correct otp");
  }

  let updatedBooking = await updateBookingById(booking._id, {
    isVerified: true,
  });

  if (!sessionExists || sessionExists.length === 0) {
    await createChargingSession({
      bookingId: updatedBooking._id,
      chargerId: updatedBooking.chargerId,
    });
  }

  updatedBooking = _.omit(updatedBooking.toObject(), ["otp"]);
  return updatedBooking;
};

//need to remove below functions
const cancelBookingByIdService = async () => {};

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
  verifyBookingOtpService,
  // getAvailableSlotsService,
  // getBookingsByStationIdService,
  // getBookingsByUserIdService,
};
