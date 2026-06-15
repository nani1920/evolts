/** @format */

const express = require("express");
const router = express.Router();

const {
  isAuthenticated,
  authorizeRole,
} = require("../../middlewares/auth.middleware");
const {
  validate,
  validateQuery,
  validateParams,
} = require("../../middlewares/validate");

const {
  createCharger,
  findChargerById,
  getAllChargerByStationId,
  updateChargerStatusById,
  updateChargerById,
  deleteChargerById,
  findChargerByStationAndId,
  getAvailableSlotsById,
} = require("./chargers.controller");

const {
  createChargerRequest,
  updateChargerRequest,
  updateStationQueryRequest,
  getAvailableSlotsParamsRequest,
  getAvailableSlotsBodyRequest,
  getAllChargersQueryRequest,
} = require("./chargers.request");

router.use(isAuthenticated);

//routes
router.post(
  "/",
  authorizeRole("admin", "station_owner"),
  validate(createChargerRequest),
  createCharger,
);

router.get("/:chargerId", findChargerById);
router.get(
  "/station/:stationId",
  validateQuery(getAllChargersQueryRequest),
  getAllChargerByStationId,
);

router.patch(
  "/:chargerId",
  authorizeRole("admin", "station_owner"),
  validateQuery(updateStationQueryRequest),
  updateChargerStatusById,
);

router.put(
  "/:chargerId",
  authorizeRole("admin", "station_owner"),
  validate(updateChargerRequest),
  updateChargerById,
);

router.delete(
  "/:chargerId",
  authorizeRole("admin", "station_owner"),
  deleteChargerById,
);

router.post(
  "/:chargerId/get-slots",
  validate(getAvailableSlotsBodyRequest),
  validateParams(getAvailableSlotsParamsRequest),
  getAvailableSlotsById,
);

router.get("/:chargerId/station/:stationId", findChargerByStationAndId);
module.exports = router;
