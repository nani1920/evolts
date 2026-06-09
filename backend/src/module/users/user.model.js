/** @format */
const mongoose = require("mongoose");
const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    vehicles: [
      {
        vehicleNo: {
          type: String,
          uppercase: true,
          trim: true,
        },
        type: {
          type: String,
          enum: ["2wheeler", "4wheeler"],
          default: "4wheeler",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const userModel = mongoose.model("user", UserSchema);
module.exports = userModel;
