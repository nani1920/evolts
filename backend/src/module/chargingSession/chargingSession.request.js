/** @format */

const { z } = require("zod");

const mongoose = require("mongoose");
const isMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getSessionByIdRequest = z
  .object({
    sessionId: z
      .string()
      .refine((id) => isMongoId(id), { message: "Invalid sessionId" }),
  })
  .strict();
const startSessionRequest = z.object({
  bookingId: z
    .string()
    .refine((id) => isMongoId(id), { message: "Invalid bookingId" }),
});
const endSessionRequest = z.object({
  bookingId: z
    .string()
    .refine((id) => isMongoId(id), { message: "Invalid bookingId" }),
});
module.exports = {
  getSessionByIdRequest,
  startSessionRequest,
  endSessionRequest,
};
