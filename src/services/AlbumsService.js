/* eslint-disable array-callback-return */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { mapAlbumToModel } = require('../utils/mapAlbumToModel');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbumWithSongs = {
      text: 'SELECT * FROM albums,songs WHERE songs.album_id = $1 AND albums.id = $1',
      values: [id],
    };

    const queryAlbumWithoutSongs = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const albumWithSongs = await this._pool.query(queryAlbumWithSongs);

    const albumWithoutSongs = await this._pool.query(queryAlbumWithoutSongs);

    const listSongs = [];

    const album = albumWithoutSongs.rows.map(mapAlbumToModel)[0];

    albumWithSongs.rows.map((song) => listSongs.push({
      id: song.id,
      title: song.titile,
      performer: song.performer,
    }));

    const data = {
      ...album,
      songs: listSongs,
    };

    if (!listSongs.length && !albumWithoutSongs.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return data;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memeperbarui Album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus Album. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
