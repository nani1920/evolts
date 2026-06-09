/** @format */

const userModel = require("./user.model");

const findUserById = (id) => {
  return userModel.findById(id);
};

module.exports = {
  findUserById,
};
