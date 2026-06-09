/** @format */

const { sendResponse, sendErrorResponse } = require("../../utils/response");
const {
  createStationService,
  getAllStationsService,
  getStationByIdService,
  updateStationService,
  deleteStationService,
} = require("./station.service");

const createStation = async (req, res) => {
  try {
    const station = await createStationService(req.body);

    return sendResponse(res, 201, "station created successfully", station);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const getStations = async (req, res) => {
  try {
    const stations = await getAllStationsService(req.query);

    return sendResponse(res, 200, "All Available Stations", stations);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const getStation = async (req, res) => {
  try {
    const { stationId } = req.params;
    const station = await getStationByIdService(stationId);
    return sendResponse(res, 200, `Station: ${station.name}`, station);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const updateStation = async (req, res) => {
  try {
    const { stationId } = req.params;
    const station = await updateStationService(stationId, req.body);

    return sendResponse(res, 200, "Station Updated Successfully", station);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

const deleteStation = async (req, res) => {
  try {
    const { stationId } = req.params;

    const station = await deleteStationService(stationId);
    return sendResponse(res, 200, "Station Deleted Successfully", station);
  } catch (error) {
    sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};

module.exports = {
  createStation,
  getStations,
  getStation,
  updateStation,
  deleteStation,
};
