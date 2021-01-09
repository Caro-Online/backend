const Joi = require('joi');

const matchValidation = {};

matchValidation.createMatch = {
  body: Joi.object({
    players: Joi.array().required(),
    roomId: Joi.string().required(),
  }),
};

matchValidation.getCurrentMatchByIdOfRoom = {
  params: Joi.object({
    roomId: Joi.string().required(),
  }),
};

matchValidation.addMove = {
  body: Joi.object({
    index: Joi.number().required(),
    matchId: Joi.string().required(),
    xIsNext: Joi.boolean().required(),
    roomId: Joi.string().required(),
  }),
};

matchValidation.getMatchById = {
  params: Joi.object({
    matchId: Joi.string().required(),
  }),
};

matchValidation.endMatch = {
  params: Joi.object({
    matchId: Joi.string().required(),
  }),
  body: Joi.object({
    loserId: Joi.string().required(),
  }),
};

matchValidation.postNewPassword = {
  body: Joi.object({
    userId: Joi.string().required(),
    password: Joi.string().required(),
    resetToken: Joi.string().required(),
  }),
};

module.exports = matchValidation;
