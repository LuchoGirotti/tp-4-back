import {config} from './dbconfig.js'
import express from "express";
import 'dotenv/config'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import pkg from 'pg'
const {Client} = pkg;

const app = express()
app.use(express.json())
const PORT = 8000

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autorización requerido' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
    
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    } else {
      return res.status(401).json({ error: 'Error de autenticación' });
    }
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userid) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const client = new Client(config);
    await client.connect();

    const userResult = await client.query('SELECT rol FROM usuario WHERE userid = $1', [req.user.userid]);
    
    if (userResult.rows.length === 0) {
      await client.end();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userRole = userResult.rows[0].rol;
    await client.end();

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
    }

    next();
    
  } catch (error) {
    console.error('Error en verifyAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

app.get('/', (req, res) => {
  res.send('API funcionando')
})

app.post('/crearusuario', async (req, res) => {
  try {
    let { userid, nombre, password, rol } = req.body;
    if (!userid || !password || !nombre) {
      return res.status(400).json({ error: 'Faltan datos' });
    }
    
    const client = new Client(config);
    await client.connect();

    const existingUser = await client.query('SELECT userid FROM usuario WHERE userid = $1', [userid]);
    if (existingUser.rows.length > 0) {
      await client.end();
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    if (!rol || rol == null) {
      rol = "usuario";
    }

    if (rol !== "usuario" && rol !== "admin") {
      await client.end();
      return res.status(400).json({ error: 'El rol no es válido' });
    }

    const result = await client.query(
      'INSERT INTO usuario (userid, nombre, password, rol) VALUES ($1, $2, $3, $4) RETURNING userid, nombre',
      [userid, nombre, await bcrypt.hash(password, 10), rol]
    );

    await client.end();
    return res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    if (client) await client.end();
    return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { userid, password } = req.body;
    if (!userid || !password) {
      return res.status(400).json({ error: 'Faltan datos' });
    }
    
    const client = new Client(config);
    await client.connect();

    const userResult = await client.query('SELECT userid, nombre, password FROM usuario WHERE userid = $1', [userid]);
    
    if (userResult.rows.length === 0) {
      await client.end();
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      await client.end();
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    await client.end();

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
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/escucho', verifyToken, async (req, res) => {
  try {
    const userid = req.user.userid;

    const client = new Client(config);
    await client.connect();

    const query = `
      SELECT e.id, c.nombre AS cancion_nombre, e.reproducciones
      FROM escucha e
      JOIN cancion c ON e.cancionid = c.id
      WHERE e.userid = $1
    `;

    const result = await client.query(query, [userid]);
    await client.end();

    res.json({
      usuario: req.user.nombre,
      canciones_escuchadas: result.rows
    });

  } catch (error) {
    console.error('Error en /escucho:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/admin/usuarios', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const client = new Client(config);
    await client.connect();

    const result = await client.query('SELECT userid, nombre, rol FROM usuario ORDER BY userid');
    await client.end();

    res.json({
      message: 'Lista de usuarios (solo admin)',
      usuarios: result.rows
    });

  } catch (error) {
    console.error('Error en /admin/usuarios:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
})