const pg = require('pg');
require('dotenv').config();

const sslEnabled = String(process.env.DB_SSL ?? 'true').toLowerCase() !== 'false';
const dbHostRaw = String(process.env.DB_HOST || '').trim();
const databaseUrl = String(process.env.DATABASE_URL || '').trim() ||
    (dbHostRaw.startsWith('postgres://') || dbHostRaw.startsWith('postgresql://') ? dbHostRaw : '');

const pool = databaseUrl
    ? new pg.Pool({
        connectionString: databaseUrl,
        ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    })
    : new pg.Pool({
        host: dbHostRaw,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT || 5432),
        ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    });


pool.on('connect', () => console.log('Conectado exitosamente'));

module.exports = pool;