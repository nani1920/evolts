/** @format */

const { createUser, updateUser, findUserByMail } = require("./auth.repository");
const { createError } = require("../../utils/createError");
const { generateToken } = require("../../utils/helpers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const registerUser = async (data) => {
  const { username, phoneNumber, email, password, role, vehicles } = data;
  const { vehicleNo, type } = vehicles?.[0] || {};

  const isUserExist = await findUserByMail(email);
  if (isUserExist) {
    throw createError(409, "user already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userData = {
    username,
    phoneNumber,
    email,
    password: hashedPassword,
    role,
    vehicles: [
      {
        vehicleNo,
        type,
      },
    ],
  };

  const user = await createUser(userData);

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  const safeUser = _.omit(user.toObject(), ["password"]);
  return { user: safeUser, token };
};

const loginUser = async (data) => {
  const { email, password } = data;
  const user = await findUserByMail(email);
  if (!user) {
    throw createError(404, "User not exist with this email, plz register");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw createError(401, "Password is not Matched");
  }

  //create jwt
  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  const safeUser = _.omit(user.toObject(), ["password"]);
  return { user: safeUser, token };
};

module.exports = { registerUser, loginUser };
