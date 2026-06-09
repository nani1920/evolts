/** @format */
const connectDb = require("./src/config/db");
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const port = process.env.PORT;

app.use(express.json());

const authRoute = require("./src/module/auth/auth.routes");
const stationRoute = require("./src/module/stations/station.routes");
const bookingRoute = require("./src/module/bookings/bookings.routes");

app.listen(port, () => {
  connectDb();
  console.log("server is running at localhost:", port);
});

app.use("/auth/", authRoute);
app.use("/station/", stationRoute);
app.use("/booking/", bookingRoute);
