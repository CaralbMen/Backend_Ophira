const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { resolverActivoParaMovimiento, registrarMovimientoActualizacion } = require('../utils/movimientoLogger');

const login= async(req, res)=>{
    const {correo, password}= req.body;
    console.log('Correo recibido: ', correo);

    try{
        const usuario= await pool.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
        if(usuario.rows.length === 0) return res.status(401).json({message: 'Usuario no encontrado'});
        const isMatch= await bcrypt.compare(password, usuario.rows[0].password);
        if(!isMatch) return res.status(401).json({message: 'Contraseña incorrecta'});

        // if (Number(usuario.rows[0].id_rol) !== 1) {
        //     return res.status(403).json({message: 'Acceso denegado. Solo administradores pueden ingresar.'});
        // }

        const payload= {
            id: usuario.rows[0].id_usuario,
            nombre: usuario.rows[0].nombre_usuario,
            rol: usuario.rows[0].id_rol
        };

        try {
            await pool.query(
                "INSERT INTO login (id_usuario, fecha, hora) VALUES ($1, (CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City')::date, (CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City')::time)",
                [usuario.rows[0].id_usuario]
            );

            // const idActivoMovimiento = await resolverActivoParaMovimiento(usuario.rows[0].id_usuario, pool);
            // if (idActivoMovimiento) {
            //     await registrarMovimientoActualizacion({
            //         idUsuario: usuario.rows[0].id_usuario,
            //         idActivo: idActivoMovimiento,
            //         descripcion: `Inicio de sesion del usuario ${usuario.rows[0].nombre_usuario}`,
            //         campoModificado: 'login',
            //         valorAnterior: null,
            //         valorNuevo: 'sesion_iniciada',
            //         justificacion: 'Registro automatico de autenticacion',
            //         db: pool,
            //     });
            // }
        } catch (movError) {
            console.error('No se pudo registrar movimiento de login:', movError);
        }

        const token= jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'});
        console.log('Token generado: ', token);
        res.status(200).json({mensaje: 'Login exitoso', usuario: usuario.rows[0], token: token, codigo:200});

    }catch(e){
        console.error(e);
        res.status(500).json({message: 'Error en el servidor', codigo: 500, error: e});
    }
}
module.exports= {login};