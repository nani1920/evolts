/** @format */

const { bookingModel } = require("./booking.model");

const createBooking = async (data) => {
  return await bookingModel.create(data);
};

const getAllBookings = async (filters = {}, page = 1, limit = 10) => {
  // return await bookingModel
  //   .find(filters)
  //   .sort({ createdAt: -1 })
  //   .skip((page - 1) * limit)
  //   .limit(limit);

  const result = await bookingModel.aggregate([
    { $match: filters },
    {
      $facet: {
        bookings: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  ]);
  const total = result[0]?.total[0]?.count;
  const totalPages = Math.ceil(total / limit);

  return { totalItems: total, totalPages, bookings: result[0].bookings };
};

const getBookingById = async (bookingId) => {
  return await bookingModel.findById(bookingId);
};

const getBookingStatusById = async (bookingId) => {
  return await bookingModel.findById(bookingId).select("status");
};

const updateBookingStatusById = async (bookingId, status) => {
  return await bookingModel.findOneAndUpdate(
    { _id: bookingId },
    { status },
    { runValidators: true, returnDocument: "after" },
  );
};

const deleteBookingById = async (bookingId) => {
  return await bookingModel.findByIdAndDelete(bookingId);
};

const getBookingsByUserId = async (userId) => {
  return await bookingModel.find({ userId });
};

const getBookingsByStationId = async (stationId) => {
  return await bookingModel.find({ stationId });
};

const getBookingsByDate = async (date) => {
  return await bookingModel.find({ bookingDate: date });
};

const getBookingByStartAndEndTime = async (stationId, startTime, endTime) => {
  return await bookingModel.findOne({
    stationId,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });
};

const getAllSlots = async (stationId, startTime, endTime) => {
  return await bookingModel.find({
    stationId,
    startTime: { $gt: startTime },
    endTime: { $lt: endTime },
    status: { $ne: "cancelled" },
  });
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingStatusById,
  updateBookingStatusById,
  deleteBookingById,
  getBookingsByUserId,
  getBookingsByStationId,
  getBookingsByDate,
  getBookingByStartAndEndTime,
  getAllSlots,
};
