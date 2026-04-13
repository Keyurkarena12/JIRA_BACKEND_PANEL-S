import Joi from "joi";

export const loginvalidation = Joi.object({

    email: Joi.string().email().required().messages({
        "string.email": "please provide a valid email"
    }),
    password: Joi.string()
        .pattern(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])'))
        .required().messages({
            "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        })  

})
