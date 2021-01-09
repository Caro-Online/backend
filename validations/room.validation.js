const Joi = require('joi');

const roomValidation = {};

roomValidation.getRoom = {
  params: Joi.object({
    roomId: Joi.string().required(),
  }),
};

roomValidation.getRoomDetail = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

roomValidation.createRoom = {
  body: Joi.object({
    name: Joi.string().required(),
    userId: Joi.string().required(),
    rule: Joi.boolean().required(),
    roomPassword: Joi.string(),
    countdownDuration: Joi.number().required(),
  }),
};

roomValidation.joinRoom = {
  body: Joi.object({
    userId: Joi.string().required(),
  }),
  params: Joi.object({
    roomId: Joi.string().required(),
  }),
};

roomValidation.outRoom = {
  body: Joi.object({
    userId: Joi.string().required(),
  }),
  params: Joi.object({
    roomId: Joi.string().required(),
  }),
};

roomValidation.joinPlayerQueue = {
  body: Joi.object({
    userId: Joi.string().required(),
  }),
  params: Joi.object({
    roomId: Joi.string().required(),
  }),
};

roomValidation.updateRoomStatus = {
  body: Joi.object({
    status: Joi.string().required(),
  }),
  params: Joi.object({
    roomId: Joi.string().required(),
  }),
};

roomValidation.updatePlayerIsReady = {
  body: Joi.object({
    userId: Joi.string().required(),
    isReady: Joi.boolean().required(),
  }),
  params: Joi.object({
    roomId: Joi.string().required(),
  }),
};

roomValidation.updateRoomWhenPlayerNotReady = {
  body: Joi.object({
    userId: Joi.string().required(),
  }),
  params: Joi.object({
    roomId: Joi.string().required(),
  }),
};

module.exports = roomValidation;
