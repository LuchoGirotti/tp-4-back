import { UserService } from '../services/userService.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  getListeningHistory = async (req, res) => {
    try {
      const userid = req.user.userid;
      const canciones = await this.userService.getUserListeningHistory(userid);

      res.json({
        usuario: req.user.nombre,
        canciones_escuchadas: canciones
      });

    } catch (error) {
      console.error('Error en /escucho:', error);
      res.status(500).json({ error: error.message });
    }
  };
}
