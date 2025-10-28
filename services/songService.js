import { Cancion } from '../models/modelo_cancion.js';
import { Escucha } from '../models/modelo_escucha.js';

export class SongService {
  async createSong(nombre) {
    const newSong = await Cancion.create({ nombre });

    return {
      id: newSong.id,
      nombre: newSong.nombre
    };
  }

  async updateSong(id, nombre) {
    const song = await Cancion.findByPk(id);

    if (!song) {
      throw new Error('Canción no encontrada');
    }

    song.nombre = nombre;
    await song.save();

    return {
      id: song.id,
      nombre: song.nombre
    };
  }

  async deleteSong(id) {
    const song = await Cancion.findByPk(id);

    if (!song) {
      throw new Error('Canción no encontrada');
    }

    const listeningCount = await Escucha.count({
      where: { cancionid: id }
    });

    if (listeningCount > 0) {
      throw new Error('No se puede eliminar la canción porque tiene registros de escucha asociados');
    }

    await song.destroy();

    return { message: 'Canción eliminada exitosamente' };
  }
}

