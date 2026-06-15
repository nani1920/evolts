/** @format */

const { ReturnDocument } = require("mongodb");
const chargingSessionModel = require("./chargingSession.model");

const createChargingSession = async (data) => {
  return await chargingSessionModel.create(data);
};

const findChargingSessionById = async (sessionId) => {
  return await chargingSessionModel.findById(sessionId);
};

const findChargingSession = async (filters, populate = null) => {
  return await chargingSessionModel.find(filters).populate(populate).lean();
};

const updateChargingSessionById = async (filters, data) => {
  return await chargingSessionModel.findOneAndUpdate(
    { ...filters },
    { ...data },
    {
      runValidators: true,
      returnDocument: "after",
    },
  );
};

module.exports = {
  createChargingSession,
  findChargingSession,
  updateChargingSessionById,
  findChargingSessionById,
};
