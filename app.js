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



app.get('/', (req, res) => {
  res.send('API funcionando')
})

app.post('/crearusuario', async (req, res) => {
  
  try {
    const { nombre, password } = req.body;
    if (!nombre || !password) {
      return res.status(400).json({ error: 'Faltan datos' });
    }
    
    const client = new Client(config);
    await client.connect();

    const existingUser = await client.query('SELECT id FROM usuario WHERE nombre = $1', [nombre]);
    if (existingUser.rows.length > 0) {
      await client.end();
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    const result = await client.query(
      'INSERT INTO usuario (nombre, password) VALUES ($1, $2) RETURNING id, nombre',
      [nombre, await bcrypt.hash(password, 10)]
    );

    await client.end();
    res.status(201).json({
      message: 'Usuario creado',
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: error.message });
  }
})

app.post('/login', async (req, res) => {
  try {
    const { nombre, password } = req.body;
    if (!nombre || !password) {
      return res.status(400).json({ error: 'Faltan datos' });
    }
    
    const client = new Client(config);
    await client.connect();
    const userResult = await client.query('SELECT id, nombre, password FROM usuario WHERE nombre = $1', [nombre]);
    
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
        userId: user.id, 
        nombre: user.nombre 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token: token,
      usuario: {
        id: user.id,
        nombre: user.nombre
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
})

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
})