import { ListeningService } from '../services/listeningService.js';

export class ListeningController {
  constructor() {
    this.listeningService = new ListeningService();
  }

  recordListening = async (req, res) => {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Cuerpo de la petición inválido' });
      }

      const { id } = req.body;
      const userid = req.user.userid;
      
      if (!id) {
        return res.status(400).json({ error: 'El id de la canción es requerido' });
      }

      if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'El id debe ser un número válido' });
      }

      const result = await this.listeningService.recordListening(userid, parseInt(id));
      return res.status(201).json(result);
      
    } catch (error) {
      if (error.message === 'Canción no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error en recordListening:', error);
      return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  };
}
