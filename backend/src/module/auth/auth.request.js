/** @format */

const { z } = require("zod");

const registerRequest = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "username should have atleast 3 characters"),
    phoneNumber: z
      .string()
      .trim()
      .length(10, "phoneNumber should be exact 10 characters"),
    email: z.string().trim().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be atleast 6 characters"),
    role: z.enum(["user", "admin"]).optional(),
    vehicles: z
      .array(
        z.object({
          vehicleNo: z.string().length(10),
          type: z.enum(["2wheeler", "4wheeler"]),
        }),
      )
      .optional(),
  })
  .strict();

const loginRequest = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be atleast 6 characters"),
});

module.exports = {
  registerRequest,
  loginRequest,
};
