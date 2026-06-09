/** @format */

const express = require("express");
const router = express.Router();
const { register, login } = require("./auth.controller");
const { validate } = require("../../middlewares/validate");
const { registerRequest, loginRequest } = require("./auth.request");

router.post("/register", validate(registerRequest), register);
router.post("/login", validate(loginRequest), login);

module.exports = router;
