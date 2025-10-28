import { DataTypes } from 'sequelize';
import { sequelize } from '../dbconfig.js';

export const Usuario = sequelize.define('Usuario', {
  userid: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'usuario',
    validate: {
      isIn: [['usuario', 'admin']]
    }
  }
}, {
  tableName: 'usuario',
  timestamps: false
});
