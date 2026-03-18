const pool= require('../config/db');
const bcrypt= require('bcrypt');


const obtenerUsuario= async(req, res)=>{
    const id = req.params.id;
    if(!correo) return res.status(400).json({message: 'El correo es requerido'});
    try{
        const usuario= await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if(usuario.rows.length === 0) return null;
        return usuario.rows[0];
    }catch(e){
        console.error(e);
        return null;
    }
}
const crearUsuario= async(req, res)=>{
    const {nombre, nickname, apaterno, amaterno, correo, password, telefono, id_rol, id_puesto}= req.body;
    if(!nombre) return res.status(400).json({message: 'El nombre es requerido'});
    if(!nickname) return res.status(400).json({message: 'El apodo es requerido'});
    if(!apaterno) return res.status(400).json({message: 'El apellido paterno es requerido'});
    if(!amaterno) return res.status(400).json({message: 'El apellido materno es requerido'});
    if(!correo) return res.status(400).json({message: 'El correo es requerido'});
    const usuario= await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if(usuario.rows.length > 0){
        return res.status(400).json({mensaje: 'Este correo ya está registrado. Intenta con otro.'});
    }
    if(!password) return res.status(400).json({message: 'La contraseña es requerida'});
    if(!telefono) return res.status(400).json({message: 'El teléfono es requerido'});
    if(!id_rol) return res.status(400).json({message: 'El id del rol es requerido'});
    if(!id_puesto) return res.status(400).json({message: 'El id del puesto es requerido'});
    try{
        const salt= await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password, salt);
        const result= await pool.query('INSERT INTO usuarios (nombre, nickname, apaterno, amaterno, correo, password, telefono, id_rol, id_puesto) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [nombre, nickname, apaterno, amaterno, correo, hashedPassword, telefono, id_rol, id_puesto]);
        res.status(201).json({mensaje: 'Usuario creado exitosamente', usuario: result.rows[0], codigo: 201});
    }catch(e){
        console.error(e);
        res.status(500).json({message: 'Error al crear el usuario', codigo: 500, error:e});
    }
}
const obtenerUsuarios= async(req, res)=>{
    try{
        const result= await pool.query('SELECT * FROM usuarios');
        if(result.rowCount===0){
            res.status(404).json({mensaje: 'No hay usuarios guardados', codigo: 404});
        }
        console.log(result);
        res.status(200).json({mensaje: 'Usuarios obtenidos', codigo: 200, data: result});
    }catch(e){
        console.log('error: '+e);
        res.status(500).json({mensaje:'Error en el servidor', codigo: 500, error: e});
    }
}

const modificarUsuario= async(req, res)=>{
    const {nombre, apaterno, amaterno, correo, password, telefono, id_rol, id_puesto}= req.body;
    const id= req.params.id;
    try{
        const result= await pool.query('UPDATE usuarios SET nombre=$1, apaterno=$2, amaterno=$3, correo=$4, password=$5, telefono=$6, id_rol=$7, id_puesto=$8 WHERE id=$9',
            [nombre, apaterno, amaterno, correo, password, telefono, id_rol, id_puesto, id]
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
        const result= await pool.query('DELETE FROM usuarios WHERE id=$1', [id]);
        if(result.affectedRows === 0){
            return res.status(404).json({mensaje: 'Usuario no encontrado', codigo: 404});
        }
        res.status(200).json({mensaje: 'Usuario eliminado exitosamente', codigo: 200});
    }catch(e){
        console.error(e);
        res.status(500).json({message: 'Error al eliminar el usuario', codigo: 500, error: e});
    }
}

module.exports= {crearUsuario, login, obtenerUsuarios, obtenerUsuario, modificarUsuario, eliminarUsuario};