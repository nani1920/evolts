/** @format */

const chargerModel = require("./chargers.model");

const createCharger = async (data) => {
  return await chargerModel.create(data);
};

const findChargerById = async (chargerId) => {
  return await chargerModel.findById(chargerId);
};
const findChargers = async (filters, page = 1, limit = 10) => {
  const pipeline = [];
  if (Object.keys(filters).length > 0) {
    pipeline.push({ ...filters });
  }
  const pagination = {
    $facet: {
      chargers: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      total: [{ $count: "count" }],
    },
  };
  pipeline.push(pagination);
  const result = await chargerModel.aggregate(pipeline);

  const total = result[0]?.total[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);
  return {
    totalItems: total,
    totalPages,
    chargers: result[0]?.chargers || [],
  };
};
const findChargerByStationId = async (stationId) => {
  return await chargerModel.find({ stationId });
};

const updateChargerById = async (chargerId, data) => {
  return await chargerModel.findOneAndUpdate(
    { _id: chargerId },
    { ...data },
    { runValidators: true, returnDocument: "after" },
  );
};

const deleteChargerById = async (chargerId) => {
  return await chargerModel.findByIdAndDelete(chargerId);
};

module.exports = {
  createCharger,
  findChargers,
  findChargerById,
  updateChargerById,
  deleteChargerById,
};
