/** @format */

const { createError } = require("../../utils/createError");
const { findStationById } = require("../stations/station.repository");
const { getAllSlots } = require("../bookings/booking.repository");
const {
  createCharger,
  findChargerById,
  updateChargerById,
  deleteChargerById,
  findChargers,
} = require("./chargers.repository");
const {
  generateStartAndEndTime,
  formatTimeIST,
} = require("../../utils/helpers");
const { filter } = require("lodash");

const getChargersFilters = (station, options) => {
  const filters = {
    $match: {
      ...(options.chargerNo && {
        chargerNo: { $regex: `^${options.chargerNo}`, $options: "i" },
      }),
      ...(options.connectorType && { connectorType: options.connectorType }),
      ...(options.status && { status: options.status }),
      ...(options.minPower || options.maxPower
        ? {
            powerKw: {
              ...(options.minPower && { $gte: Number(options.minPower) }),
              ...(options.maxPower && { $lte: Number(options.maxPower) }),
            },
          }
        : {}),
      ...(options.minPrice || options.maxPrice
        ? {
            pricingPerKwh: {
              ...(options.minPrice && { $gte: Number(options.minPrice) }),
              ...(options.maxPrice && { $lte: Number(options.maxPrice) }),
            },
          }
        : {}),
    },
  };
  return filters;
};

const createChargerService = async (data) => {
  const {
    stationId,
    chargerNo,
    connectorType,
    status,
    powerKw,
    pricingPerKwh,
  } = data;

  const station = await findStationById(stationId);
  if (!station) {
    throw createError(404, "Station Not Found");
  }
  const charger = await createCharger(data);
  return charger;
};

const getChargerByIdService = async (chargerId) => {
  const charger = await findChargerById(chargerId);
  if (!charger) {
    throw createError(404, "charger Not Found");
  }
  return charger;
};

const updateChargerStatusByIdService = async (chargerId, queryData) => {
  const { status } = queryData;
  const charger = await updateChargerById(chargerId, { status });

  if (!charger) {
    throw createError(404, "charger Not Found");
  }
  return charger;
};

const updateChargerByIdService = async (chargerId, data) => {
  const { chargerNo, connectorType, status, powerKw, pricingPerKwh } = data;
  const updatedData = {
    ...(chargerNo && { chargerNo }),
    ...(connectorType && { connectorType }),
    ...(status && { status }),
    ...(powerKw && { powerKw }),
    ...(pricingPerKwh && { pricingPerKwh }),
  };

  const charger = await updateChargerById(chargerId, updatedData);

  if (!charger) {
    throw createError(404, "charger Not Found");
  }
  return charger;
};

const deleteChargerByIdService = async (chargerId) => {
  const charger = await deleteChargerById(chargerId);
  if (!charger) {
    throw createError(404, "Charger Not Found");
  }
  return charger;
};

const getAllChargerByStationIdService = async (stationId, options) => {
  const station = await findStationById(stationId);
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;

  if (!station) {
    throw createError(404, "Station Not Found");
  }

  const filters = getChargersFilters(station, options);

  const { totalItems, totalPages, chargers } = await findChargers(
    filters,
    page,
    limit,
  );

  return {
    page,
    limit,
    totalItems,
    totalPages,
    chargers: chargers.length > 0 ? chargers : "chargers Not Found",
  };
};

const getAvailableSlotsByChargerIdService = async (chargerId, data) => {
  const { date } = data;

  if (!date) {
    throw createError(400, "Date is required");
  }

  const charger = await findChargerById(chargerId);
  if (!charger) {
    throw createError(404, "charger Not Found");
  }

  const station = await findStationById(charger.stationId);
  if (!station) {
    throw createError(500, "Station Not Found");
  }

  const { startTime, endTime } = generateStartAndEndTime(
    date,
    station.openTime,
    station.closeTime,
  );

  const bookings = await getAllSlots(
    { chargerId: charger._id },
    startTime,
    endTime,
  );

  const bookedRanges = bookings.map((b) => ({
    start: new Date(b.startTime),
    end: new Date(b.endTime),
  }));

  const allSlots = [];
  for (
    let time = new Date(startTime);
    time < endTime;
    time = new Date(time.getTime() + 60 * 60 * 1000)
  ) {
    const slotStart = new Date(time);
    const slotEnd = new Date(time.getTime() + 60 * 60 * 1000);

    const isBooked = bookedRanges.some(
      ({ start, end }) => slotStart < end && slotEnd > start,
    );

    allSlots.push({
      slotStart: formatTimeIST(slotStart),
      slotEnd: formatTimeIST(slotEnd),
      isAvailable: !isBooked,
    });
  }

  return allSlots;
};

const findChargerByStationAndIdService = async (params) => {
  const { stationId, chargerId } = params;
  const station = await findStationById(stationId);
  if (!station) {
    throw createError(404, "Station Not Found");
  }
  const [charger] = await findChargers({
    _id: chargerId,
    stationId: stationId,
  });
  if (!charger || charger.length === 0) {
    throw createError(404, `No Charger found in station ${stationId}`);
  }
  return charger;
};

module.exports = {
  createChargerService,
  getChargerByIdService,
  updateChargerStatusByIdService,
  updateChargerByIdService,
  deleteChargerByIdService,
  getAllChargerByStationIdService,
  findChargerByStationAndIdService,
  getAvailableSlotsByChargerIdService,
};
