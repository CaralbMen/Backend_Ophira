const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { resolverActivoParaMovimiento, registrarMovimientoActualizacion } = require('../utils/movimientoLogger');
const { enviarCodigoRecuperacion } = require('../utils/emailService');

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

// Solicitar recuperación de contraseña - genera código de 4 dígitos
const forgotPassword = async(req, res) => {
    const { correo } = req.body;

    try {
        // Verificar si el usuario existe
        const usuario = await pool.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
        if(usuario.rows.length === 0) {
            return res.status(404).json({message: 'Usuario no encontrado'});
        }

        const idUsuario = usuario.rows[0].id_usuario;

        // Generar código de 4 dígitos
        const codigo = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Calcular fecha de expiración (15 minutos)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Guardar el código en base de datos
        await pool.query(
            'INSERT INTO reset_password_token (id_usuario, codigo, expires_at) VALUES ($1, $2, $3)',
            [idUsuario, codigo, expiresAt]
        );

        // Enviar correo con el código
        try {
            await enviarCodigoRecuperacion(correo, codigo);
            res.status(200).json({
                message: 'Se envió un código de recuperación a tu correo electrónico',
                codigo: 200
            });
        } catch (emailError) {
            console.error('Error al enviar correo:', emailError);
            res.status(500).json({
                message: 'Hubo un error al enviar el correo. Por favor intenta de nuevo.',
                codigo: 500
            });
        }

    } catch(e) {
        console.error(e);
        res.status(500).json({message: 'Error en el servidor', codigo: 500, error: e});
    }
};

// Verificar código de recuperación
const verifyResetCode = async(req, res) => {
    const { correo, codigo } = req.body;

    try {
        // Obtener usuario por correo
        const usuario = await pool.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
        if(usuario.rows.length === 0) {
            return res.status(404).json({message: 'Usuario no encontrado'});
        }

        const idUsuario = usuario.rows[0].id_usuario;

        // Buscar código válido (no usado y no expirado)
        const token = await pool.query(
            'SELECT * FROM reset_password_token WHERE id_usuario = $1 AND codigo = $2 AND usado = false AND expires_at > NOW()',
            [idUsuario, codigo]
        );

        if(token.rows.length === 0) {
            return res.status(400).json({message: 'Código inválido o expirado'});
        }

        res.status(200).json({
            message: 'Código verificado correctamente',
            codigo: 200,
            tokenId: token.rows[0].id
        });

    } catch(e) {
        console.error(e);
        res.status(500).json({message: 'Error en el servidor', codigo: 500, error: e});
    }
};

// Cambiar contraseña con código de recuperación
const resetPassword = async(req, res) => {
    const { correo, codigo, nuevaPassword } = req.body;

    try {
        // Validar que se proporcionaron todos los datos
        if(!correo || !codigo || !nuevaPassword) {
            return res.status(400).json({message: 'Faltan datos requeridos'});
        }

        // Obtener usuario por correo
        const usuario = await pool.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
        if(usuario.rows.length === 0) {
            return res.status(404).json({message: 'Usuario no encontrado'});
        }

        const idUsuario = usuario.rows[0].id_usuario;

        // Verificar que el código sea válido
        const token = await pool.query(
            'SELECT * FROM reset_password_token WHERE id_usuario = $1 AND codigo = $2 AND usado = false AND expires_at > NOW()',
            [idUsuario, codigo]
        );

        if(token.rows.length === 0) {
            return res.status(400).json({message: 'Código inválido o expirado'});
        }

        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

        // Actualizar contraseña del usuario
        await pool.query(
            'UPDATE usuario SET password = $1 WHERE id_usuario = $2',
            [hashedPassword, idUsuario]
        );

        // Marcar el token como usado
        await pool.query(
            'UPDATE reset_password_token SET usado = true WHERE id = $1',
            [token.rows[0].id]
        );

        res.status(200).json({
            message: 'Contraseña actualizada correctamente',
            codigo: 200
        });

    } catch(e) {
        console.error(e);
        res.status(500).json({message: 'Error en el servidor', codigo: 500, error: e});
    }
};

module.exports= {login, forgotPassword, verifyResetCode, resetPassword};