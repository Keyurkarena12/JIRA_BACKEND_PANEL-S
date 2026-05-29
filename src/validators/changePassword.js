import Joi from 'joi';

export const changePasswordValidation = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string()
    .min(6)
    .max(20)
    .required()
    .pattern(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])'))
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base':
        'Password must contain uppercase, lowercase, number, and special character',
    }),
});
