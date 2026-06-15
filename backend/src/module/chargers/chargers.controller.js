/** @format */
const { sendErrorResponse, sendResponse } = require("../../utils/response");
const {
  createChargerService,
  getChargerByIdService,
  updateChargerStatusByIdService,
  updateChargerByIdService,
  deleteChargerByIdService,
  getAllChargerByStationIdService,
  findChargerByStationAndIdService,
  getAvailableSlotsByChargerIdService,
} = require("./chargers.service");
const createCharger = async (req, res) => {
  try {
    const charger = await createChargerService(req.body);
    return sendResponse(res, 201, "Charger Created Successfully", charger);
  } catch (error) {
    if (error.code === 11000) {
      console.log(error.code);
      return sendErrorResponse(
        res,
        409,
        "ChargerNo already exists in this station",
      );
    }
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const findChargerById = async (req, res) => {
  try {
    const charger = await getChargerByIdService(req.params.chargerId);
    return sendResponse(res, 200, `charger ${charger.chargerNo}`, charger);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};
const updateChargerStatusById = async (req, res) => {
  try {
    const charger = await updateChargerStatusByIdService(
      req.params.chargerId,
      req.query,
    );
    sendResponse(res, 200, "Successfully Updated the status", charger);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const updateChargerById = async (req, res) => {
  try {
    const charger = await updateChargerByIdService(
      req.params.chargerId,
      req.body,
    );
    return sendResponse(res, 200, "Charger Updated Successfully", charger);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};
const deleteChargerById = async (req, res) => {
  try {
    const charger = await deleteChargerByIdService(req.params.chargerId);
    return sendResponse(res, 200, "Charger Deleted Successfully", charger);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const getAllChargerByStationId = async (req, res) => {
  try {
    const chargers = await getAllChargerByStationIdService(
      req.params.stationId,
      req.query,
    );
    sendResponse(
      res,
      200,
      `All chargers of station: ${req.params.stationId}`,
      chargers,
    );
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const findChargerByStationAndId = async (req, res) => {
  try {
    const charger = await findChargerByStationAndIdService(req.params);
    sendResponse(
      res,
      200,
      `chargerNo ${charger.chargerNo} in station ${charger.stationId}`,
      charger,
    );
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const getAvailableSlotsById = async (req, res) => {
  try {
    const slots = await getAvailableSlotsByChargerIdService(
      req.params.chargerId,
      req.body,
    );
    sendResponse(
      res,
      200,
      `available slots of charger: ${req.params.chargerId}`,
      slots,
    );
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

module.exports = {
  createCharger,
  findChargerById,
  updateChargerStatusById,
  updateChargerById,
  deleteChargerById,
  getAllChargerByStationId,
  findChargerByStationAndId,
  getAvailableSlotsById,
};
