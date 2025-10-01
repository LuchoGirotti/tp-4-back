import express from "express";
import 'dotenv/config';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import songRoutes from './routes/songs.js';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('API funcionando');
});

app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', songRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
