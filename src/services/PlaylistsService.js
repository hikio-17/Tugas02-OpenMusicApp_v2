/* eslint-disable max-len */
/* eslint-disable no-plusplus */
/* eslint-disable no-unreachable-loop */
/* eslint-disable no-await-in-loop */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      INNER JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1 
     `,
      values: [owner],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus playlist. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyCollabolator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this.verifyCollabolator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addSongsInPlaylist(playlistId, songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    const id = `songPlaylist-${nanoid(16)}`;
    const addSongQuery = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    await this._pool.query(addSongQuery);
  }

  async getSongsInPlaylist(playlistId) {
    const queryPlaylist = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists INNER JOIN users ON users.id = playlists.owner WHERE playlists.id = $1 ',
      values: [playlistId],
    };

    const resultPlaylist = await this._pool.query(queryPlaylist);

    const playlist = resultPlaylist.rows[0];

    const querySongs = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs INNER JOIN playlistsongs ON playlistsongs.song_id = songs.id WHERE playlistsongs.playlist_id = $1',
      values: [playlistId],
    };

    const resultSongs = await this._pool.query(querySongs);

    const songsInPlaylist = resultSongs.rows;

    const data = {
      ...playlist,
      songs: songsInPlaylist,
    };

    return data;
  }

  async deleteSongsInPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlistsongs.playlist_id = $1 AND playlistsongs.song_id = $2',
      values: [playlistId, songId],
    };

    await this._pool.query(query);
  }

  async getPlaylistActivitiesById(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
      FROM playlist_song_activities 
      INNER JOIN users ON users.id = playlist_song_activities.user_id
      INNER JOIN songs ON songs.id = playlist_song_activities.song_id
      WHERE playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw InvariantError('Belum ada aktivitas pada playlist');
    }

    const activities = result.rows;

    const data = {
      playlistId,
      activities,
    };

    return data;
  }

  async addActivitiesInPlaylist(playlistId, songId, userId, action) {
    const id = `activities-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, time],
    };

    await this._pool.query(query);
  }
}

module.exports = PlaylistsService;
