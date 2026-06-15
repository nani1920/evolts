/** @format */

const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET;

const generateToken = (data) => {
  return jwt.sign(data, jwtSecret, { expiresIn: "7d" });
};

const validateToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

const checkCanUpdateStatus = (currentStatus, newStatus, role) => {
  const allowedTransactions = {
    user: {
      booked: ["arrived", "cancelled"],
      arrived: ["charging", "cancelled"],
      charging: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    },
    station_owner: {
      booked: ["arrived", "charging", "completed", "cancelled"],
      arrived: ["charging", "completed", "cancelled"],
      charging: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    },
    admin: {
      booked: ["arrived", "charging", "completed", "cancelled"],
      arrived: ["charging", "completed", "cancelled"],
      charging: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    },
  };

  const roleRules = allowedTransactions[role];
  if (!roleRules) return false;

  return roleRules[currentStatus]?.includes(newStatus);
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateStartAndEndTime = (date, start, end) => {
  const [year, month, day] = date.split("-").map(Number);
  const [startHr, startMm] = start.split(":").map(Number);
  const [endHr, endMm] = end.split(":").map(Number);
  console.log(year, month, day);
  console.log(startHr, startMm);
  console.log(endHr, endMm);
  // const startTime = new Date(
  //   Date.UTC(year, month - 1, day, startHr, startMm, 0),
  // );
  // const endTime = new Date(Date.UTC(year, month - 1, day, endHr, endMm, 0));
  const startTime = new Date(`${date}T${start}:00+05:30`);
  const endTime = new Date(`${date}T${end}:00+05:30`);
  return { startTime, endTime };
};

const formatTimeIST = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
module.exports = {
  generateToken,
  validateToken,
  checkCanUpdateStatus,
  generateOTP,
  generateStartAndEndTime,
  formatTimeIST,
};
