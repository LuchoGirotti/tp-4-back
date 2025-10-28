import express from "express";
import 'dotenv/config';
import { sequelize } from './dbconfig.js';
import { Usuario } from './models/modelo_usuario.js';
import { Cancion } from './models/modelo_cancion.js';
import { Escucha } from './models/modelo_escucha.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import songRoutes from './routes/songs.js';

Usuario.hasMany(Escucha, { foreignKey: 'userid', sourceKey: 'userid' });
Escucha.belongsTo(Usuario, { foreignKey: 'userid', targetKey: 'userid' });

Cancion.hasMany(Escucha, { foreignKey: 'cancionid', sourceKey: 'id' });
Escucha.belongsTo(Cancion, { foreignKey: 'cancionid', targetKey: 'id' });

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('API funcionando');
});

app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', songRoutes);

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database synchronized successfully');
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error synchronizing database:', error);
  });
