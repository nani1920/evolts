/** @format */

const mongoose = require("mongoose");

const chargingSessionSchema = mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Types.ObjectId,
      ref: "booking",
      unique: true,
      required: true,
    },
    chargerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "charger",
      required: true,
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    energyConsumedKwh: {
      type: Number,
      default: 0,
    },
    pricePerKwh: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "pending"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const chargingSessionModel = mongoose.model(
  "chargingSession",
  chargingSessionSchema,
);

module.exports = chargingSessionModel;
