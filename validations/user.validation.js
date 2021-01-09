const Joi = require('joi');

const userValidation = {};

userValidation.getAllUser = {
  query: Joi.object({
    keyword: Joi.string(),
  }),
};

userValidation.getSearch = {
  query: Joi.object({
    keyword: Joi.string(),
  }),
};

userValidation.updateStatusToOnline = {
  params: Joi.object({
    userId: Joi.string().required(),
  }),
};

userValidation.update = {
  params: Joi.object({
    userId: Joi.string().required(),
  }),
  body: Joi.object({
    user: Joi.object().required(),
  }),
};

userValidation.getUserById = {
  params: Joi.object({
    userId: Joi.string().required(),
  }),
};

module.exports = userValidation;
