const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistPayloadSchema, PostSongToPlaylistPayloadSchema } = require('./schema');

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePostSongToPlaylistPayload: (payload) => {
    const validationResult = PostSongToPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
