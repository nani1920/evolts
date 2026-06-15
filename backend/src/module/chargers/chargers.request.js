/** @format */

const { z } = require("zod");
const mongoose = require("mongoose");
const isMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const createChargerRequest = z
  .object({
    stationId: z
      .string()
      .refine((id) => isMongoId(id), { message: "Invalid stationId" }),
    chargerNo: z
      .string()
      .min(3, "chargerNo should be atleast 3 characters")
      .trim(),
    connectorType: z.enum(["CCS", "CHAdeMO", "NACS", "Type2"], {
      message: "connectorType should be [CCS, CHAdeMO, NACS, Type2] ",
    }),
    status: z.enum(["available", "maintenance"], {
      message: "status values should be either [available, maintenance]",
    }),
    powerKw: z.coerce.number().min(0, "powerKw can't be negative"),
    pricingPerKwh: z.coerce.number().min(0, "pricingPerKwh can't be negative"),
  })
  .strict();

const updateChargerRequest = createChargerRequest
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "atleast one field is required to update.",
  });

const updateStationQueryRequest = z
  .object({
    status: z.enum(["available", "maintenance"], {
      message: "status values should be either [available, maintenance]",
    }),
  })
  .strict();

const getAvailableSlotsBodyRequest = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid date format (YYYY-MM-DD required)",
  }),
});
const getAvailableSlotsParamsRequest = z.object({
  chargerId: z
    .string()
    .refine((id) => isMongoId(id), { message: "Invalid chargerId" }),
});

const getAllChargersQueryRequest = z
  .object({
    chargerNo: z.string().trim().optional(),
    connectorType: z
      .enum(["CCS", "CHAdeMO", "NACS", "Type2"], {
        message: "connectorType should be [CCS, CHAdeMO, NACS, Type2] ",
      })
      .optional(),
    status: z
      .enum(["available", "maintenance"], {
        message: "status values should be either [available, maintenance]",
      })
      .optional(),
    minPower: z.coerce.number().min(0, "minPower must be +ve").optional(),
    maxPower: z.coerce.number().min(1, "maxPower must be +ve").optional(),
    minPrice: z.coerce.number().min(0, "minPrice must be atLeast 0").optional(),
    maxPrice: z.coerce.number().min(0, "maxPrice must be atLeast 0").optional(),
    page: z.coerce
      .number()
      .min(1, "page number should be atLeast 1")
      .default(1),
    limit: z.coerce
      .number()
      .min(10, "limit number should be atLeast 10")
      .default(10),
  })
  .strict();

module.exports = {
  createChargerRequest,
  updateChargerRequest,
  updateStationQueryRequest,
  getAvailableSlotsParamsRequest,
  getAvailableSlotsBodyRequest,
  getAllChargersQueryRequest,
};
