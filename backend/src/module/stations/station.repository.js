/** @format */

const { stationModel } = require("./station.model");
const mongoose = require("mongoose");

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

const findAllStations = async (
  filters = {},
  geoOptions = null,
  page = 1,
  limit = 10,
) => {
  const pipeline = [];

  if (geoOptions && geoOptions.lat && geoOptions.lng && geoOptions.radius) {
    pipeline.push({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(geoOptions.lng), Number(geoOptions.lat)],
        },
        maxDistance: geoOptions.radius,
        distanceField: "distanceInMeters",
        spherical: true,
      },
    });

    pipeline.push({
      $addFields: {
        distance: {
          $round: [{ $divide: ["$distanceInMeters", 1000] }, 1],
        },
      },
    });
  }

  if (Object.keys(filters).length > 0) {
    pipeline.push({ $match: filters });
  }

  pipeline.push({
    $facet: {
      stations: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      total: [{ $count: "count" }],
    },
  });

  const result = await stationModel.aggregate(pipeline);

  const total = result[0]?.total[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    totalItems: total,
    totalPages,
    stations: result[0]?.stations || [],
  };
};

const findStationById = async (id) => {
  // return await stationModel.findById(id);
  const [station] = await stationModel.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: "chargers",
        let: { stationId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$stationId", "$$stationId"],
              },
              // status: "available",
            },
          },
          {
            $project: {
              createdAt: 0,
              updatedAt: 0,
            },
          },
        ],
        // localField: "_id",
        // foreignField: "stationId",
        as: "chargers",
      },
    },
    // {
    //   $project: {
    //     createdAt: 0,
    //     updatedAt: 0,
    //   },
    // },
  ]);
  return station;
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
