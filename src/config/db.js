const pg = require('pg');
require('dotenv').config();

// const sslEnabled = String(process.env.DB_SSL ?? 'true').toLowerCase() !== 'false';

// const pool = process.env.DATABASE_URL
// 	? new pg.Pool({
// 		connectionString: process.env.DATABASE_URL,
// 		ssl: sslEnabled ? { rejectUnauthorized: false } : false
// 	})
// 	: new pg.Pool({
// 		host: process.env.DB_HOST,
// 		database: process.env.DB_NAME,
// 		user: process.env.DB_USER,
// 		password: process.env.DB_PASSWORD,
// 		port: Number(process.env.DB_PORT || 5432),
// 		ssl: sslEnabled ? { rejectUnauthorized: false } : false
// 	});
const pool= new pg.Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


pool.on('connect', () => console.log('Conectado exitosamente'));

module.exports = pool;