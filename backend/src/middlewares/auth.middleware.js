/** @format */

const express = require("express");
const { createError } = require("../utils/createError");
const { sendErrorResponse } = require("../utils/response");
const { validateToken } = require("../utils/helpers");

const isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      return sendErrorResponse(res, 401, "Authorization Header missing");
    }
    const token = authHeader.split(" ")[1];
    const data = validateToken(token);
    req.user = data;
    console.log(req.user.role);
    // if (req.user.role !== "user" || req.user.role !== "admin") {
    //   return sendErrorResponse(res, 403, "Access Denied");
    // }
    next();
  } catch (error) {
    sendErrorResponse(res, 401, "Invalid jwtToken");
  }
};

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return sendErrorResponse(res, 403, "Access Denied");
    }
    next();
  };
};
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return sendErrorResponse(res, 403, "Access Denied");
  }
  next();
};

module.exports = { isAdmin, isAuthenticated, authorizeRole };
