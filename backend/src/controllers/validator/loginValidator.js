import { body } from "express-validator";

export const validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email"),

  body("password")
    .notEmpty().withMessage("Password is required")
];