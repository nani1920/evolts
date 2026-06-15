/** @format */
const _ = require("lodash");
const { createError } = require("../../utils/createError");
const {
  getBookingById,
  updateBookingById,
} = require("../bookings/booking.repository");

const {
  findChargingSession,
  updateChargingSessionById,
  findChargingSessionById,
} = require("./chargingSession.repository");

const validateStartSessionBooking = (booking) => {
  if (!booking) {
    throw createError(404, "Booking Not found");
  }
  if (!booking.isVerified) {
    throw createError(
      400,
      "plz verify otp at the station, to start charging session",
    );
  }
};
const validateStartChargingSession = (chargingSession) => {
  if (!chargingSession) {
    throw createError(404, "charging session is Not found with this booking");
  }
  if (chargingSession.status === "completed") {
    throw createError(400, "session is already completed");
  }
  if (chargingSession.status === "active") {
    throw createError(
      400,
      `charging session is already started at time: ${chargingSession.startedAt.toLocaleString()}`,
    );
  }
};
const validateChargingSessionStatus = (status) => {
  switch (status) {
    case "pending":
      throw createError(400, "session can't be ended before it started");
    case "active":
      break;
    case "completed":
      throw createError(400, "session is already completed");
    default:
      throw createError(500, "Invalid session Status");
  }
};
const validateEndSessionBooking = (booking) => {
  if (!booking) {
    throw createError(404, "booking Not Found");
  }
  if (booking.status !== "charging") {
    throw createError(
      400,
      "session can only be stopped, when booking status is in charging mode",
    );
  }
};
const validateEndChargingSession = (chargingSession) => {
  if (!chargingSession) {
    throw createError(404, "charging session is not found");
  }
  validateChargingSessionStatus(chargingSession.status);
  const charger = chargingSession.chargerId;
  if (!charger) {
    throw createError(500, "charger details are missing");
  }
  return charger;
};

//Service-Routes
const createChargingSessionService = async (data) => {
  const { bookingId, startedAt } = data;
};

const startChargingSessionService = async (bookingId) => {
  const booking = await getBookingById(bookingId);

  validateStartSessionBooking(booking);
  const [chargingSession] = await findChargingSession({
    bookingId: booking._id,
  });
  validateStartChargingSession(chargingSession);

  const updatedChargingSession = await updateChargingSessionById(
    { bookingId: booking._id },
    { status: "active", startedAt: new Date() },
  );
  await updateBookingById(booking._id, {
    status: "charging",
  });

  return _.pick(updatedChargingSession.toObject(), [
    "_id",
    "bookingId",
    "startedAt",
    "status",
  ]);
};

const endChargingSessionService = async (bookingId) => {
  const booking = await getBookingById(bookingId);
  validateEndSessionBooking(booking);
  const populate = [
    {
      path: "chargerId",
    },
  ];
  const [chargingSession] = await findChargingSession(
    {
      bookingId: booking._id,
    },
    populate,
  );
  const charger = validateEndChargingSession(chargingSession);

  //calculate session cost
  // energyConsumedKwh = duration * powerKw
  // total = energyConsumedKwh * pricePerKwh

  const start = chargingSession.startedAt;
  const end = new Date();
  const durationMin = Math.ceil((end - start) / (1000 * 60));
  const energy = (durationMin * charger.powerKw) / 60;
  const energyKwh = Math.round(energy * 100) / 100;
  const total = Math.round(energyKwh * charger.pricingPerKwh * 100) / 100;

  const updatedBody = {
    status: "completed",
    endedAt: end,
    energyConsumedKwh: energyKwh,
    pricePerKwh: charger.pricingPerKwh,
    total: total,
  };
  const updatedChargingSession = await updateChargingSessionById(
    {
      _id: chargingSession._id,
    },
    updatedBody,
  );

  await updateBookingById(booking._id, {
    status: "completed",
  });

  return updatedChargingSession;
};

const getChargingSessionByIdService = async (sessionId) => {
  const populate = [
    {
      path: "chargerId",
    },
    {
      path: "bookingId",
      select: "-otp",
    },
  ];
  const [chargingSession] = await findChargingSession(
    { _id: sessionId },
    populate,
  );
  if (!chargingSession) {
    throw createError(404, "charging session Not Found");
  }
  const { bookingId, chargerId, ...rest } = chargingSession;
  const safeChargingSession = {
    ...rest,
    booking: bookingId,
    charger: chargerId,
  };
  return safeChargingSession;
};

module.exports = {
  createChargingSessionService,
  startChargingSessionService,
  endChargingSessionService,
  getChargingSessionByIdService,
};
