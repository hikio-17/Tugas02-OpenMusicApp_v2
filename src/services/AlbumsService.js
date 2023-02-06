/* eslint-disable array-callback-return */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

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
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const resultAlbum = await this._pool.query(queryAlbum);

    if (!resultAlbum.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = resultAlbum.rows[0];

    const querySongInAlbum = {
      text: `SELECT songs.id, songs.performer 
      FROM songs
      INNER JOIN albums ON albums.id = songs.album_id
      WHERE albums.id = $1
      `,
      values: [id],
    };

    const resultSongs = await this._pool.query(querySongInAlbum);

    const songs = resultSongs.rows;

    const data = {
      ...album,
      songs,
    };

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
