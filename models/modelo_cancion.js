import { DataTypes } from 'sequelize';
import { sequelize } from '../dbconfig.js';

export const Cancion = sequelize.define('Cancion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'cancion',
  timestamps: false
});
