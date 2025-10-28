import bcrypt from 'bcrypt';
import { Usuario } from '../models/modelo_usuario.js';
import { Escucha } from '../models/modelo_escucha.js';
import { Cancion } from '../models/modelo_cancion.js';

export class UserService {
  async createUser(userid, nombre, password, rol = 'usuario') {
    const existingUser = await Usuario.findOne({
      where: { userid }
    });
    
    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    if (rol !== "usuario" && rol !== "admin") {
      throw new Error('El rol no es válido');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Usuario.create({
      userid,
      nombre,
      password: hashedPassword,
      rol
    });

    return {
      userid: newUser.userid,
      nombre: newUser.nombre
    };
  }

  async authenticateUser(userid, password) {
    const user = await Usuario.findOne({
      where: { userid }
    });
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Contraseña incorrecta');
    }

    return {
      userid: user.userid,
      nombre: user.nombre
    };
  }

  async getUserRole(userid) {
    const user = await Usuario.findOne({
      where: { userid },
      attributes: ['rol']
    });
    
    return user ? user.rol : null;
  }

  async getUserListeningHistory(userid) {
    const listenings = await Escucha.findAll({
      where: { userid },
      include: [{
        model: Cancion,
        attributes: ['nombre']
      }],
      attributes: ['id', 'fechaEscucha'],
      order: [['fechaEscucha', 'DESC']]
    });

    return listenings.map(listening => ({
      id: listening.id,
      cancion_nombre: listening.Cancion.nombre,
      fechaEscucha: listening.fechaEscucha
    }));
  }
}

