const mapAlbumToModel = ({ id, name, year }) => ({
  id, name, year, songs: [],
});

module.exports = { mapAlbumToModel };
