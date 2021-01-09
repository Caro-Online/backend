const Joi = require('joi');

const authValidation = {};

authValidation.register = {
  body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(128),
  }),
};

authValidation.login = {
  body: Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

authValidation.confirmRegistration = {
  params: Joi.object({
    emailVerifyToken: Joi.string().required(),
  }),
};

authValidation.sendResetPasswordEmail = {
  body: Joi.object({
    email: Joi.string().required().email(),
  }),
};

authValidation.getResetPassword = {
  params: Joi.object({
    resetToken: Joi.string().required(),
  }),
};

authValidation.postNewPassword = {
  body: Joi.object({
    userId: Joi.string().required(),
    password: Joi.string().required(),
    resetToken: Joi.string().required(),
  }),
};

module.exports = authValidation;
