import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService.js';

export const verifyToken = (req, res, next) => {
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

export const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userid) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const userService = new UserService();
    const userRole = await userService.getUserRole(req.user.userid);

    if (!userRole) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
    }

    next();
    
  } catch (error) {
    console.error('Error en verifyAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
