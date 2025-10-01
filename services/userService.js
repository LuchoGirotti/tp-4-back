import bcrypt from 'bcrypt';
import { DatabaseService } from './databaseService.js';

export class UserService extends DatabaseService {
  async createUser(userid, nombre, password, rol = 'usuario') {
    const existingUser = await this.executeQuery(
      'SELECT userid FROM usuario WHERE userid = $1', 
      [userid]
    );
    
    if (existingUser.rows.length > 0) {
      throw new Error('El usuario ya existe');
    }

    if (rol !== "usuario" && rol !== "admin") {
      throw new Error('El rol no es válido');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await this.executeQuery(
      'INSERT INTO usuario (userid, nombre, password, rol) VALUES ($1, $2, $3, $4) RETURNING userid, nombre',
      [userid, nombre, hashedPassword, rol]
    );

    return result.rows[0];
  }

  async authenticateUser(userid, password) {
    const userResult = await this.executeQuery(
      'SELECT userid, nombre, password FROM usuario WHERE userid = $1', 
      [userid]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    const user = userResult.rows[0];
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
    const userResult = await this.executeQuery(
      'SELECT rol FROM usuario WHERE userid = $1', 
      [userid]
    );
    
    return userResult.rows.length > 0 ? userResult.rows[0].rol : null;
  }

  async getUserListeningHistory(userid) {
    const query = `
      SELECT e.id, c.nombre AS cancion_nombre, e.reproducciones
      FROM escucha e
      JOIN cancion c ON e.cancionid = c.id
      WHERE e.userid = $1
    `;

    const result = await this.executeQuery(query, [userid]);
    return result.rows;
  }
}
