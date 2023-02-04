const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().require(),
});

module.exports = { PlaylistPayloadSchema };
