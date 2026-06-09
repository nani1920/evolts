/** @format */

const { z } = require("zod");

const createStationRequest = z
  .object({
    name: z.string().trim().min(3, "atleast 3 characters Required"),
    address: z.string().trim().min(5, "Please Enter Valid Address"),
    location: z.object({
      type: z.enum(["Point"]),
      coordinates: z
        .array(z.number())
        .length(2, "Coordinates Must be Longitude and Latitude"),
    }),
    status: z.enum(["offline", "online"]),
    pricing: z.number().min(1, "Please Enter Price More than 0"),
    chargerTypes: z.object({
      charger: z.enum(["slow", "fast", "superFast"]),
      powerOut: z.string().optional(),
    }),
  })
  .strict();

const updateStationRequest = createStationRequest.partial().refine(
  (data) => {
    return Object.keys(data).length > 0;
  },
  {
    message: "atleast One field is required to update.",
  },
);

const getAllStationsRequest = z
  .object({
    name: z.string().optional(),
    status: z.enum(["offline", "online"]).optional(),
    chargeType: z.enum(["slow", "fast", "superFast"]).optional(),
    minPrice: z.coerce
      .number()
      .min(0, "minPrice must be greater than 0")
      .optional(),
    maxPrice: z.coerce.number().min(0, "maxPrice must be atleast 0").optional(),
    lat: z.coerce
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .optional(),
    lng: z.coerce
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .optional(),
    radius: z.coerce
      .number()
      .min(1, "Radius must be at least 1 meter")
      .max(100000, "Radius cannot exceed 100km (100,000 meters)")
      .default(5000)
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
module.exports = {
  createStationRequest,
  updateStationRequest,
  getAllStationsRequest,
};
