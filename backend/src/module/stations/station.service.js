/** @format */

const _ = require("lodash");
const { createError } = require("../../utils/createError");

const {
  createStation,
  findStationByLocation,
  findAllStations,
  findStationById,
  updateStationById,
  findByStationIdAndDelete,
} = require("./station.repository");

const createStationService = async (data) => {
  const { name, address, location, status, pricing, chargerTypes } = data;

  const stationExist = await findStationByLocation(location);

  if (stationExist) {
    throw createError(409, "station already Exists");
  }

  const updatedStation = {
    name,
    address,
    location,
    status,
    pricing,
    chargerTypes,
  };

  const station = await createStation(updatedStation);

  return station;
};

const getAllStationsService = async (options) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;

  const filters = {
    ...(options.name && {
      name: { $regex: `^${options.name}`, $options: "i" },
    }),
    ...(options.status && { status: options.status }),
    ...(options.chargeType && { "chargerTypes.charger": options.chargeType }),
    ...(options.minPrice || options.maxPrice
      ? {
          pricing: {
            ...(options.minPrice && { $gte: Number(options.minPrice) }),
            ...(options.maxPrice && { $lte: Number(options.maxPrice) }),
          },
        }
      : {}),
  };

  let geoOptions = null;
  if (options.lat && options.lng) {
    geoOptions = {
      lat: Number(options.lat),
      lng: Number(options.lng),
      radius: Number(options.radius) || 5000, // Default 5km
    };
  }

  const { totalItems, totalPages, stations } = await findAllStations(
    filters,
    geoOptions,
    page,
    limit,
  );
  // if (!stations || stations.length === 0) {
  //   throw createError(404, "No Stations Found");
  // }
  return { page, totalItems, totalPages, stations };
};

const getStationByIdService = async (stationId) => {
  const station = await findStationById(stationId);
  if (!station) {
    throw createError(404, "Station Not Found");
  }
  return station;
};

const updateStationService = async (stationId, data) => {
  //   const { name, address, location, status, pricing, chargerType } = data;

  const stationExist = await findStationById(stationId);
  if (!stationExist) {
    throw createError(404, "Station Not Found");
  }
  const body = _.pick(data, [
    "name",
    "address",
    "location",
    "status",
    "pricing",
    "chargerTypes",
  ]);

  const updatedBody = {};
  Object.keys(body).forEach((key) => {
    if (body[key] !== undefined && body[key] !== "") {
      updatedBody[key] = body[key];
    }
  });

  if (Object.keys(updatedBody).length === 0) {
    throw createError(400, "no valid fields to Update");
  }

  const updatedStation = await updateStationById(stationId, updatedBody);
  return updatedStation;
};

const deleteStationService = async (stationId) => {
  const station = await findByStationIdAndDelete(stationId);
  if (!station) {
    throw createError(404, "Station Not found");
  }
  return station;
};

module.exports = {
  createStationService,
  getAllStationsService,
  getStationByIdService,
  updateStationService,
  deleteStationService,
};
