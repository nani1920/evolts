/** @format */

const userModel = require("../users/user.model");

const createUser = async (data) => {
  return await userModel.create(data);
};

const updateUser = async (id, data) => {
  if (id) {
    return await userModel.findByIdAndUpdate(id, { ...data }, { new: true });
  }
};
const findUserByMail = async (email) => {
  return userModel.findOne({ email });
};

module.exports = {
  createUser,
  updateUser,
  findUserByMail,
};
