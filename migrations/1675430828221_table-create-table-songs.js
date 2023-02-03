/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      required: true,
    },
    year: {
      type: 'INT',
      notNull: true,
    },
    genre: {
      type: 'TEXT',
      required: true,
    },
    performer: {
      type: 'TEXT',
      required: true,
    },
    duration: {
      type: 'INT',
    },
    album_id: {
      type: 'VARCHAR(50)',
    },
  });

  pgm.addConstraint('songs', 'fk_songs.album_id_albums_id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
