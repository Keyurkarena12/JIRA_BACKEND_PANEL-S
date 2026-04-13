import joi from "joi";

export const resetpasswordValidation = joi.object({
  email: joi.string().email().required(),
  resetpasswordcode: joi.string().required(),
  newpassword: joi.string()
  .min(6)
  .max(20)
  .required()
  .pattern(
    new RegExp("^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])")
  )
  .messages({
    "string.min": "Password must be at least 6 characters long",
    "string.pattern.base": "Password must contain uppercase, lowercase, number, and special character",
  }),
});
