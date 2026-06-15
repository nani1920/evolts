/** @format */

const userModel = require("./user.model");

const findUserById = (id) => {
  return userModel.findById(id);
};
const findUser = (filters) => {
  return userModel.find(filters);
};

module.exports = {
  findUserById,
};
