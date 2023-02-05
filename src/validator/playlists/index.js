const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistPayloadSchema, PostSongToPlaylistPayloadSchema, DeleteSongInPlaylistPayloadSchema } = require('./schema');

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePostSongInPlaylistPayload: (payload) => {
    const validationResult = PostSongToPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateDeletetSongInPlaylistPayload: (payload) => {
    const validationResult = DeleteSongInPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
