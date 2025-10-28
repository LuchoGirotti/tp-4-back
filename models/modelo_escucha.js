import { DataTypes } from 'sequelize';
import { sequelize } from '../dbconfig.js';

export const Escucha = sequelize.define('Escucha', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userid: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'usuario',
      key: 'userid'
    }
  },
  cancionid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cancion',
      key: 'id'
    }
  },
  fechaEscucha: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'escucha',
  timestamps: false
});
