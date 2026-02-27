const pg= require('pg');
require ('dotenv').config();
const pool= new pg.Pool({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});
pool.on('connect', ()=>console.log('Conectado exitosamente'));
module.exports= pool;