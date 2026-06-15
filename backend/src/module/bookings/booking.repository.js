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

  const pipeline = [];
  if (Object.keys(filters).includes("match")) {
    pipeline.push({ $match: filters.match });
  }
  if (Object.keys(filters).includes("lookup")) {
    filters.lookup.forEach((l) => pipeline.push({ $lookup: l }));
  }
  if (Object.keys(filters).includes("addFields")) {
    pipeline.push({ $addFields: filters.addFields });
  }
  if (Object.keys(filters).includes("project")) {
    pipeline.push({ $project: filters.project });
  }
  const pagination = {
    $facet: {
      bookings: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      total: [{ $count: "count" }],
    },
  };
  pipeline.push(pagination);
  const result = await bookingModel.aggregate(pipeline);
  const total = result[0]?.total[0]?.count;
  const totalPages = Math.ceil(total / limit);

  return { totalItems: total, totalPages, bookings: result[0].bookings };
};

const getBookingById = async (bookingId, populate = null) => {
  return await bookingModel.findById(bookingId).populate(populate);
};

const getBookingStatusById = async (bookingId) => {
  return await bookingModel.findById(bookingId).select("status");
};

const updateBookingById = async (bookingId, data) => {
  return await bookingModel.findOneAndUpdate(
    { _id: bookingId },
    { ...data },
    {
      runValidators: true,
      returnDocument: "after",
    },
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

const getBookingByStartAndEndTime = async (chargerId, startTime, endTime) => {
  return await bookingModel.findOne({
    chargerId,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    status: { $ne: "cancelled" },
  });
};


const getAllSlots = async (searchBy, startTime, endTime) => {
  console.log(searchBy);
  return await bookingModel.find({
    ...searchBy,
    // OVERLAP condition (correct)
    startTime: { $lte: endTime },
    endTime: { $gte: startTime },

    status: { $ne: "cancelled" },
  });
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingStatusById,
  updateBookingById,
  deleteBookingById,
  getBookingsByUserId,
  getBookingsByStationId,
  getBookingsByDate,
  getBookingByStartAndEndTime,
  getAllSlots,
};
