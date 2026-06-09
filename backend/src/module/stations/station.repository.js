/** @format */

const { stationModel } = require("./station.model");

const createStation = async (data) => {
  return await stationModel.create(data);
};

const findStationByLocation = async (location) => {
  return await stationModel.findOne({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: location.coordinates,
        },
        $maxDistance: 20,
      },
    },
  });
};

const findAllStations = async (filters = {}, page = 1, limit = 10) => {
  // return await stationModel.find();
  const result = await stationModel.aggregate([
    { $match: filters },
    {
      $facet: {
        stations: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  ]);

  const total = result[0]?.total[0]?.count;
  const totalPages = Math.ceil(total / limit);

  return { totalItems: total, totalPages, stations: result[0].stations };
};

const findStationById = async (id) => {
  return await stationModel.findById(id);
};

const updateStationById = async (id, data) => {
  return await stationModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const findByStationIdAndDelete = async (id) => {
  return await stationModel.findByIdAndDelete(id);
};

module.exports = {
  createStation,
  findStationByLocation,
  findAllStations,
  findStationById,
  updateStationById,
  findByStationIdAndDelete,
};
