const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login= async(req, res)=>{
    const {correo, password}= req.body;
    console.log('Correo recibido: ', correo);

    try{
        const usuario= await pool.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
        if(usuario.rows.length === 0) return res.status(401).json({message: 'Usuario no encontrado'});
        const isMatch= await bcrypt.compare(password, usuario.rows[0].password);
        if(!isMatch) return res.status(401).json({message: 'Contraseña incorrecta'});

        const payload= {
            id: usuario.rows[0].id_usuario,
            nombre: usuario.rows[0].nombre_usuario,
            rol: usuario.rows[0].id_rol
        };
        const token= jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'});
        console.log('Token generado: ', token);
        res.status(200).json({mensaje: 'Login exitoso', usuario: usuario.rows[0], token: token, codigo:200});

    }catch(e){
        console.error(e);
        res.status(500).json({message: 'Error en el servidor', codigo: 500, error: e});
    }
}
module.exports= {login};