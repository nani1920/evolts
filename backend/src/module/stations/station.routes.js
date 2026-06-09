/** @format */

const express = require("express");
const router = express.Router();
const { validate, validateQuery } = require("../../middlewares/validate");
const {
  createStationRequest,
  updateStationRequest,
  getAllStationsRequest,
} = require("./station.request");
const {
  createStation,
  getStations,
  getStation,
  updateStation,
  deleteStation,
} = require("./station.controller");

const {
  isAdmin,
  isAuthenticated,
} = require("../../middlewares/auth.middleware");

router.use(isAuthenticated);

router.post("/", isAdmin, validate(createStationRequest), createStation);
router.get("/", validateQuery(getAllStationsRequest), getStations);
router.get("/:stationId", getStation);
router.put(
  "/:stationId",
  isAdmin,
  validate(updateStationRequest),
  updateStation,
);
router.delete("/:stationId", isAdmin, deleteStation);

module.exports = router;
