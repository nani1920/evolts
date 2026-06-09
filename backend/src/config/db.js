/** @format */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const uri = process.env.MONGO_URI;
const connectDb = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Database is Connected Successfully ");
  } catch (error) {
    console.log("DB ERROR: ", error);
    process.exit(1);
  }
};

module.exports = connectDb;
