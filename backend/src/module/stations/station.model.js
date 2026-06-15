/** @format */

const mongoose = require("mongoose");
const stationSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
  name: {
    type: String,
    trim: true,
    minlength: 3,
    lowercase: true,
    required: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], //[longitude,latitude]
      default: [0.0, 0.0],
      required: true,
    },
  },
  status: {
    type: String,
    enum: ["online", "offline"],
    default: "online",
  },
  pricing: {
    type: Number,
  },
  openTime: {
    type: String,
    required: true,
  },
  closeTime: {
    type: String,
    required: true,
  },
});

stationSchema.index({ location: "2dsphere" });
stationSchema.index({ name: "text" });

const stationModel = mongoose.model("station", stationSchema);
module.exports = {
  stationModel,
};
