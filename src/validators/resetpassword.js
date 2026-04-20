import Joi from "joi";

export const resetpasswordValidation = Joi.object({
  email: Joi.string().trim().email().required(),
  resetpasswordcode: Joi.string().required(),
  newpassword: Joi.string()
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
