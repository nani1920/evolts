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
  authorizeRole,
} = require("../../middlewares/auth.middleware");

router.use(isAuthenticated);

router.post(
  "/",
  authorizeRole("admin", "station_owner"),
  validate(createStationRequest),
  createStation,
);
router.get("/", validateQuery(getAllStationsRequest), getStations);
router.get("/:stationId", getStation);
router.put(
  "/:stationId",
  authorizeRole("admin", "station_owner"),
  validate(updateStationRequest),
  updateStation,
);
router.delete("/:stationId", authorizeRole("admin"), deleteStation);

module.exports = router;
