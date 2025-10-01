import { SongService } from '../services/songService.js';

export class SongController {
  constructor() {
    this.songService = new SongService();
  }

  createSong = async (req, res) => {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Cuerpo de la petición inválido' });
      }

      const { nombre } = req.body;
      
      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre de la canción es requerido' });
      }

      const song = await this.songService.createSong(nombre.trim());
      return res.status(201).json({ 
        message: 'Canción creada exitosamente',
        cancion: song 
      });
      
    } catch (error) {
      console.error('Error en createSong:', error);
      return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  };

  updateSong = async (req, res) => {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Cuerpo de la petición inválido' });
      }

      const { id, nombre } = req.body;
      
      if (!id || !nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El id y nombre de la canción son requeridos' });
      }

      if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'El id debe ser un número válido' });
      }

      const song = await this.songService.updateSong(parseInt(id), nombre.trim());
      return res.status(200).json({ 
        message: 'Canción actualizada exitosamente',
        cancion: song 
      });
      
    } catch (error) {
      if (error.message === 'Canción no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error en updateSong:', error);
      return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  };

  deleteSong = async (req, res) => {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Cuerpo de la petición inválido' });
      }

      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'El id de la canción es requerido' });
      }

      if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'El id debe ser un número válido' });
      }

      const result = await this.songService.deleteSong(parseInt(id));
      return res.status(200).json(result);
      
    } catch (error) {
      if (error.message === 'Canción no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('registros de escucha asociados')) {
        return res.status(409).json({ error: error.message });
      }
      console.error('Error en deleteSong:', error);
      return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  };
}
