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
    chargerId: {
      type: mongoose.Types.ObjectId,
      ref: "charger",
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
    status: {
      type: String,
      enum: ["booked", "arrived", "charging", "completed", "cancelled"],
      default: "booked",
    },
    otp: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // price: {
    //   type: Number,
    //   required: true,
    // },
    // bookingDate: {
    //   type: Date,
    //   required: true,
    // },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ chargerId: 1, startTime: 1 }, { unique: true });

const bookingModel = mongoose.model("booking", bookingSchema);
module.exports = {
  bookingModel,
};
