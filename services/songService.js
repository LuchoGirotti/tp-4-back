import { DatabaseService } from './databaseService.js';

export class SongService extends DatabaseService {
  async createSong(nombre) {
    const result = await this.executeQuery(
      'INSERT INTO cancion (nombre) VALUES ($1) RETURNING id, nombre',
      [nombre]
    );

    return result.rows[0];
  }

  async updateSong(id, nombre) {
    const existingSong = await this.executeQuery(
      'SELECT id FROM cancion WHERE id = $1',
      [id]
    );

    if (existingSong.rows.length === 0) {
      throw new Error('Canción no encontrada');
    }

    const result = await this.executeQuery(
      'UPDATE cancion SET nombre = $1 WHERE id = $2 RETURNING id, nombre',
      [nombre, id]
    );

    return result.rows[0];
  }

  async deleteSong(id) {
    const existingSong = await this.executeQuery(
      'SELECT id FROM cancion WHERE id = $1',
      [id]
    );

    if (existingSong.rows.length === 0) {
      throw new Error('Canción no encontrada');
    }

    const listeningRecords = await this.executeQuery(
      'SELECT COUNT(*) as count FROM escucha WHERE cancionid = $1',
      [id]
    );

    if (parseInt(listeningRecords.rows[0].count) > 0) {
      throw new Error('No se puede eliminar la canción porque tiene registros de escucha asociados');
    }

    await this.executeQuery(
      'DELETE FROM cancion WHERE id = $1',
      [id]
    );

    return { message: 'Canción eliminada exitosamente' };
  }
}
