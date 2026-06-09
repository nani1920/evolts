/** @format */
const mongoose = require("mongoose");
const { z } = require("zod");

const isMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const createBookingRequest = z
  .object({
    // userId: z.refine((id) => isMongoId(id), {
    //   message: "Invalid userId",
    // }),
    stationId: z.refine((id) => isMongoId(id), {
      message: "Invalid stationId",
    }),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Invalid date format (YYYY-MM-DD required)",
    }),

    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "Invalid startTime format (HH:mm required)",
    }),

    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "Invalid endTime format (HH:mm required)",
    }),
    price: z.number().min(0, "price should be greater than 0"),
    status: z.enum(["booked", "arrived", "charging", "completed", "cancelled"]),
  })
  .strict();

const getAvailableSlotsRequest = z.object({
  stationId: z.refine((id) => isMongoId(id), {
    message: "Invalid stationId",
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid date format (YYYY-MM-DD required)",
  }),
});

const getAllBookingsQuery = z
  .object({
    stationId: z
      .refine((id) => isMongoId(id), {
        message: "Invalid stationId",
      })
      .optional(),
    userId: z
      .refine((id) => isMongoId(id), {
        message: "Invalid UserId",
      })
      .optional(),
    status: z
      .enum(["booked", "arrived", "charging", "completed", "cancelled"])
      .optional(),
    page: z.coerce
      .number()
      .min(1, "page number should be atleast 1")
      .default(1),
    limit: z.coerce
      .number()
      .min(10, "limit number should be atleast 10")
      .default(10),
  })
  .strict();

const getBookingByIdParams = z
  .object({
    bookingId: z.refine((id) => isMongoId(id), {
      message: "Invalid bookingId",
    }),
  })
  .strict();

const updateBookingStatusQuery = z.object({
  status: z.enum(["booked", "arrived", "charging", "completed", "cancelled"]),
});
module.exports = {
  createBookingRequest,
  getAvailableSlotsRequest,
  getAllBookingsQuery,
  getBookingByIdParams,
  updateBookingStatusQuery,
};
