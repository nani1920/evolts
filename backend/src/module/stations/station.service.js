/** @format */

const _ = require("lodash");
const mongoose = require("mongoose");
const { createError } = require("../../utils/createError");

const { findUserById } = require("../users/user.repository");
const {
  createStation,
  findStationByLocation,
  findAllStations,
  findStationById,
  updateStationById,
  findByStationIdAndDelete,
} = require("./station.repository");

const getStationsFilters = (options, user) => {
  const filters = {
    ...(options.name && {
      name: { $regex: `^${options.name}`, $options: "i" },
    }),
    ...(options.status && { status: options.status }),
    ...(options.minPrice || options.maxPrice
      ? {
        pricing: {
          ...(options.minPrice && { $gte: Number(options.minPrice) }),
          ...(options.maxPrice && { $lte: Number(options.maxPrice) }),
        },
      }
      : {}),
  };
  if (user.role === "station_owner") {
    filters.ownerId = new mongoose.Types.ObjectId(user.id);
  } else if (options.ownerId) {
    if (user.role === "user") {
      throw createError(403, "user can't access the stations of owner");
    }
    filters.ownerId = new mongoose.Types.ObjectId(options.ownerId);
  }

  console.log(filters);
  return filters;
};

const createStationService = async (data) => {
  const {
    ownerId,
    name,
    address,
    location,
    status,
    pricing,
    openTime,
    closeTime,
  } = data;

  const ownerExist = await findUserById(ownerId);
  if (!ownerExist) {
    throw createError(404, "ownerId Not Found");
  }

  if (ownerExist.role != "station_owner") {
    throw createError(400, "ownerId must be an Id of Owner");
  }
  const stationExist = await findStationByLocation(location);

  if (stationExist) {
    throw createError(409, "station already Exists");
  }

  const updatedStation = {
    ownerId: new mongoose.Types.ObjectId(ownerId),
    name,
    address,
    location,
    status,
    pricing,
    openTime,
    closeTime,
  };

  const station = await createStation(updatedStation);

  return station;
};

const getAllStationsService = async (options, user) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;

  const filters = getStationsFilters(options, user);
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
  return {
    page,
    limit,
    totalItems,
    totalPages,
    stations: stations.length > 0 ? stations : "stations Not Found",
  };
};

const getStationByIdService = async (stationId) => {
  let station = await findStationById(stationId);
  if (!station) {
    throw createError(404, "Station Not Found");
  }
  station = _.omit(station, "ownerId");
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
    "openTime",
    "closeTime",
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
