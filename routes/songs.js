import express from 'express';
import { SongController } from '../controllers/songController.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

const router = express.Router();
const songController = new SongController();

// Solo admin puede gestionar canciones
router.post('/cancion', verifyToken, verifyAdmin, songController.createSong);
router.put('/cancion', verifyToken, verifyAdmin, songController.updateSong);
router.delete('/cancion', verifyToken, verifyAdmin, songController.deleteSong);

export default router;
