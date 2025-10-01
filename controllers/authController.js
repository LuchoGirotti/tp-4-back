import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService.js';

export class AuthController {
  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req, res) => {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Cuerpo de la petición inválido' });
      }

      let { userid, nombre, password, rol } = req.body;
      
      if (!userid || !password || !nombre) {
        return res.status(400).json({ error: 'Faltan datos' });
      }

      const user = await this.userService.createUser(userid, nombre, password, rol);
      return res.status(201).json({ user });
      
    } catch (err) {
      if (err.message === 'El usuario ya existe') {
        return res.status(409).json({ error: err.message });
      }
      if (err.message === 'El rol no es válido') {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
    }
  };

  login = async (req, res) => {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Cuerpo de la petición inválido' });
      }

      const { userid, password } = req.body;
      
      if (!userid || !password) {
        return res.status(400).json({ error: 'Faltan datos' });
      }

      const user = await this.userService.authenticateUser(userid, password);

      const token = jwt.sign(
        { 
          userid: user.userid,
          nombre: user.nombre 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login exitoso',
        token: token,
        usuario: {
          userid: user.userid,
          nombre: user.nombre
        }
      });

    } catch (error) {
      if (error.message === 'Usuario no encontrado' || error.message === 'Contraseña incorrecta') {
        return res.status(401).json({ error: error.message });
      }
      console.error('Error en login:', error);
      res.status(500).json({ error: error.message });
    }
  };
}
