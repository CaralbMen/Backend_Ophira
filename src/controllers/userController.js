const pool= require('../config/db');
const bcrypt= require('bcryptjs');


const obtenerUsuario= async(req, res)=>{
    const id = req.params.id;
    if(!id) return res.status(400).json({message: 'El ID es requerido'});
    try{
        console.log('ID recibido: ', id);
        const usuario= await pool.query('SELECT id_usuario, nombre_usuario, apellido_paterno, apellido_materno, correo, telefono, id_rol, id_puesto, fecha_registro FROM usuario WHERE id_usuario = $1', [id]);
        if(usuario.rows.length === 0) return res.status(404).json({message: 'Usuario no encontrado', codigo: 404});
        res.status(200).json(usuario.rows[0]);
    }catch(e){
        console.error(e);
        return res.status(500).json({message: 'Error en el servidor', codigo: 500, error: e});
    }
}
const crearUsuario= async(req, res)=>{
    const {nombre_usuario, apellido_paterno, apellido_materno, correo, telefono, id_rol, id_puesto, password}= req.body;
    if(!nombre_usuario) return res.status(400).json({message: 'El nombre de usuario es requerido'});
    if(!apellido_paterno) return res.status(400).json({message: 'El apellido paterno es requerido'});
    if(!apellido_materno) return res.status(400).json({message: 'El apellido materno es requerido'});
    if(!correo) return res.status(400).json({message: 'El correo es requerido'});
    try{
        const usuario= await pool.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
        if(usuario.rows.length > 0){
            return res.status(400).json({mensaje: 'Este correo ya está registrado. Intenta con otro.'});
        }
        if(!telefono) return res.status(400).json({message: 'El teléfono es requerido'});
        if(!id_rol) return res.status(400).json({message: 'El id del rol es requerido'});
        if(!id_puesto) return res.status(400).json({message: 'El id del puesto es requerido'});
        if(!password) return res.status(400).json({message: 'La contraseña es requerida'});
        try{
            const salt= await bcrypt.genSalt(10);
            const hashedPassword= await bcrypt.hash(password, salt);
            const result= await pool.query('INSERT INTO usuario (nombre_usuario, apellido_paterno, apellido_materno, correo, telefono, id_rol, id_puesto, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
                [nombre_usuario, apellido_paterno, apellido_materno, correo, telefono, id_rol, id_puesto, hashedPassword]);
            console.log('Usuario creado: ', result.rows[0]);
            res.status(201).json({mensaje: 'Usuario creado exitosamente', usuario: result.rows[0], codigo: 201});
        }catch(e){
            console.error(e);
            res.status(500).json({message: 'Error al crear el usuario', codigo: 500, error:e});
        }
    }catch(e){
        console.error(e);
        res.status(500).json({message: 'Error al verificar el correo', codigo: 500, error: e});
    }
    
}
const obtenerUsuarios= async(req, res)=>{
    try{
        const result= await pool.query('select u.id_usuario, u.nombre_usuario, u.apellido_paterno, u.apellido_materno, u.correo, u.telefono, r.nombre as rol, p.nombre as puesto, a.nombre as area, u.activo, u.fecha_registro from usuario u join rol r on u.id_rol= r.id_rol join puesto p on u.id_puesto= p.id_puesto join area a on p.id_area= a.id_area');
        if(result.rowCount===0){
            res.status(404).json({mensaje: 'No hay usuarios guardados', codigo: 404});
        }
        console.log(result);
        res.status(200).json(result.rows);
    }catch(e){
        console.log('error: '+e);
        res.status(500).json({mensaje:'Error en el servidor', codigo: 500, error: e});
    }
}

const modificarUsuario= async(req, res)=>{
    const {nombre_usuario= '', apellido_paterno= '', apellido_materno= '', correo= '', telefono= '', id_rol= '', id_puesto= '', password= ''}= req.body;
    const id= req.params.id;
    try{
        const usuario= await pool.query('SELECT * FROM usuario WHERE id_usuario = $1', [id]);
        if(usuario.rows.length === 0){
            return res.status(404).json({mensaje: 'Usuario no encontrado', codigo: 404});
        }

        if(nombre_usuario) usuario.rows[0].nombre_usuario= nombre_usuario;
        if(apellido_paterno) usuario.rows[0].apellido_paterno= apellido_paterno;
        if(apellido_materno) usuario.rows[0].apellido_materno= apellido_materno;
        if(correo) usuario.rows[0].correo= correo;
        if(password){
            const salt= await bcrypt.genSalt(10);
            const hashedPassword= await bcrypt.hash(password, salt);
            usuario.rows[0].password= hashedPassword;
        }
        if(telefono) usuario.rows[0].telefono= telefono;
        if(id_rol) usuario.rows[0].id_rol= id_rol;
        if(id_puesto) usuario.rows[0].id_puesto= id_puesto;
        
        const result= await pool.query('UPDATE usuario SET nombre_usuario=$1, apellido_paterno=$2, apellido_materno=$3, correo=$4, password=$5, telefono=$6, id_rol=$7, id_puesto=$8 WHERE id_usuario=$9 RETURNING *',
            [usuario.rows[0].nombre_usuario, usuario.rows[0].apellido_paterno, usuario.rows[0].apellido_materno, usuario.rows[0].correo, usuario.rows[0].password, usuario.rows[0].telefono, usuario.rows[0].id_rol, usuario.rows[0].id_puesto, id]
        );
        if(result.affectedRows === 0){
            return res.status(404).json({mensaje: 'Usuario no encontrado', codigo: 404});
        }

        res.status(200).json({mensaje: 'Usuario modificado exitosamente', usuario: result.rows[0], codigo: 200});
    }catch(e){
        console.error(e);
        res.status(500).json({message: 'Error al modificar el usuario', codigo: 500, error: e});
    }
}
const eliminarUsuario= async(req, res)=>{
    const id= req.params.id;
    try{
        const result= await pool.query('DELETE FROM usuario WHERE id=$1', [id]);
        if(result.affectedRows === 0){
            return res.status(404).json({mensaje: 'Usuario no encontrado', codigo: 404});
        }
        res.status(200).json({mensaje: 'Usuario eliminado exitosamente', codigo: 200});
    }catch(e){
        console.error(e);
        res.status(500).json({message: 'Error al eliminar el usuario', codigo: 500, error: e});
    }
}

module.exports= {crearUsuario, obtenerUsuarios, obtenerUsuario, modificarUsuario, eliminarUsuario};