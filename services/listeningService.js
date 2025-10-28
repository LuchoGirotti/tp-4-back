import { Escucha } from '../models/modelo_escucha.js';
import { Cancion } from '../models/modelo_cancion.js';

export class ListeningService {
  async recordListening(userid, cancionid) {
    const song = await Cancion.findByPk(cancionid);

    if (!song) {
      throw new Error('Canción no encontrada');
    }

    const newListening = await Escucha.create({
      userid,
      cancionid,
      fechaEscucha: new Date()
    });

    return {
      id: newListening.id,
      userid: newListening.userid,
      cancionid: newListening.cancionid,
      fechaEscucha: newListening.fechaEscucha,
      message: 'Reproducción registrada exitosamente'
    };
  }
}

