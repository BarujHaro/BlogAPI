import { body } from "express-validator";

export const validateUser = [
  body("first_name")
    .trim()
    .notEmpty().withMessage("First name is required")
    .isLength({ min: 2, max: 50 }).withMessage("First name must have 2 to 50 characters")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/)
    .withMessage("First name can only contain letters, spaces, apostrophes and dashes"),

  body("last_name")
    .trim()
    .notEmpty().withMessage("Last name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Last name must have 2 to 50 characters")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/)
    .withMessage("Last name can only contain letters, spaces, apostrophes and dashes"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must have at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&.,]/).withMessage("Password must contain at least one special character"),

  body("confirmPassword")
    .notEmpty().withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
];