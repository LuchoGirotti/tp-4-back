import express from 'express';
import { UserController } from '../controllers/userController.js';
import { ListeningController } from '../controllers/listeningController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();
const userController = new UserController();
const listeningController = new ListeningController();

// GET /escucho - Devuelve las canciones escuchadas por el usuario logueado
router.get('/escucho', verifyToken, userController.getListeningHistory);

// POST /escucho - Graba el registro en la tabla "escucha" 
router.post('/escucho', verifyToken, listeningController.recordListening);

export default router;
