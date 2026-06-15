/** @format */
const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const connectDb = require("./src/config/db");
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const port = process.env.PORT;
const frontendURL = process.env.FRONTEND_URL;

// allows origins using cors
app.use(
  cors({
    origin: frontendURL,
  }),
);

// rateLimiter
const limiter = rateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use(express.json());
app.use(limiter);
app.use(helmet());

const authRoute = require("./src/module/auth/auth.routes");
const stationRoute = require("./src/module/stations/station.routes");
const bookingRoute = require("./src/module/bookings/bookings.routes");
const chargerRoute = require("./src/module/chargers/chargers.routes");
const chargerSessionRoute = require("./src/module/chargingSession/chargingSession.routes");

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

app.use("/auth", authRoute);
app.use("/station", stationRoute);
app.use("/booking", bookingRoute);
app.use("/charger", chargerRoute);
app.use("/chargerSession", chargerSessionRoute);

const startServer = async () => {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log("server is running at localhost: ", port);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
startServer();
