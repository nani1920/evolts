/** @format */

const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    stationId: {
      type: mongoose.Types.ObjectId,
      ref: "station",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["booked", "arrived", "charging", "completed", "cancelled"],
      default: "booked",
    },
  },
  {
    timestamps: true,
  },
);

const bookingModel = mongoose.model("booking", bookingSchema);
module.exports = {
  bookingModel,
};
