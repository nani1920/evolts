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
  //  ["booked", "arrived", "charging", "completed", "cancelled"],
  // const allowTransactions = {
  //   booked: ["arrived", "cancelled"],
  //   arrived: ["charging", "cancelled"],
  //   charging: ["completed", "cancelled"],
  //   completed: [],
  //   cancelled: [],
  // };
  // return allowTransactions[currentStatus]?.includes(newStatus);

  const allowedTransactions = {
    user: {
      booked: ["arrived", "cancelled"],
      arrived: ["charging", "cancelled"],
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

module.exports = {
  generateToken,
  validateToken,
  checkCanUpdateStatus,
};
