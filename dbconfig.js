import { Sequelize } from 'sequelize';
export const sequelize = new Sequelize({
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false 
});
try {
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');
} catch (error) {
    console.error('❌ Unable to connect to the database:', error);
}




 