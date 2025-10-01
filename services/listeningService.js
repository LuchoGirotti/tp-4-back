import { DatabaseService } from './databaseService.js';

export class ListeningService extends DatabaseService {
  async recordListening(userid, cancionid) {
    // Verificar que la canción existe
    const songExists = await this.executeQuery(
      'SELECT id FROM cancion WHERE id = $1',
      [cancionid]
    );

    if (songExists.rows.length === 0) {
      throw new Error('Canción no encontrada');
    }

    // Verificar si ya existe un registro de escucha para este usuario y canción
    const existingRecord = await this.executeQuery(
      'SELECT id, reproducciones FROM escucha WHERE userid = $1 AND cancionid = $2',
      [userid, cancionid]
    );

    if (existingRecord.rows.length > 0) {
      // Actualizar registro existente - incrementar reproducciones
      const currentPlays = existingRecord.rows[0].reproducciones;
      const result = await this.executeQuery(
        'UPDATE escucha SET reproducciones = $1 WHERE userid = $2 AND cancionid = $3 RETURNING id, reproducciones',
        [currentPlays + 1, userid, cancionid]
      );

      return {
        id: result.rows[0].id,
        userid: userid,
        cancionid: cancionid,
        reproducciones: result.rows[0].reproducciones,
        message: 'Reproducción registrada - contador actualizado'
      };
    } else {
      // Crear nuevo registro de escucha
      const result = await this.executeQuery(
        'INSERT INTO escucha (userid, cancionid, reproducciones) VALUES ($1, $2, $3) RETURNING id, reproducciones',
        [userid, cancionid, 1]
      );

      return {
        id: result.rows[0].id,
        userid: userid,
        cancionid: cancionid,
        reproducciones: result.rows[0].reproducciones,
        message: 'Primera reproducción registrada'
      };
    }
  }
}
