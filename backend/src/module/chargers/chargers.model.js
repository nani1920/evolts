/** @format */

const mongoose = require("mongoose");

const chargersSchema = mongoose.Schema(
  {
    stationId: {
      type: mongoose.Types.ObjectId,
      ref: "station",
      required: true,
    },
    chargerNo: {
      type: String,
      trim: true,
      required: true,
    },
    connectorType: {
      type: String,
      enum: ["CCS", "CHAdeMO", "NACS", "Type2"],
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "maintenance"],
      required: true,
    },
    powerKw: {
      type: Number,
      required: true,
    },
    pricingPerKwh: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
chargersSchema.index({ chargerNo: "text" });
chargersSchema.index({ stationId: 1, chargerNo: 1 }, { unique: true });

const chargerModel = mongoose.model("charger", chargersSchema);

module.exports = chargerModel;
