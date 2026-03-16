const pool= require('../config/db');
const bcrypt= require('bcrypt');



const crearUsuario= async(req, res)=>{
    const {nombre, apaterno, amaterno, correo, password, telefono, id_rol, id_puesto}= req.body;
    if(!nombre) return res.status(400).json({message: 'El nombre es requerido'});
    if(!apaterno) return res.status(400).json({message: 'El apellido paterno es requerido'});
    if(!amaterno) return res.status(400).json({message: 'El apellido materno es requerido'});
    if(!correo) return res.status(400).json({message: 'El correo es requerido'});
    if(!password) return res.status(400).json({message: 'La contraseña es requerida'});
    if(!telefono) return res.status(400).json({message: 'El teléfono es requerido'});
    if(!id_rol) return res.status(400).json({message: 'El id del rol es requerido'});
    if(!id_puesto) return res.status(400).json({message: 'El id del puesto es requerido'});
    try{
        const salt= await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password, salt);
        const result= await pool.query('INSERT INTO usuarios (nombre, apaterno, amaterno, correo, password, telefono, id_rol, id_puesto) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [nombre, apaterno, amaterno, correo, hashedPassword, telefono, id_rol, id_puesto]);
        res.status(201).json({mensaje: 'Usuario creado exitosamente', usuario: result.rows[0]});
    }catch(e){
        console.error(e);
        res.status(500).json({message: 'Error al crear el usuario'});
    }
}
const obtenerUsuario= async(correo)=>{
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

const login= async(req, res)=>{
    const {correo, password}= req.body;
    const usuario= await obtenerUsuario(correo);
    if(!usuario) return res.status(401).json({message: 'Usuario no encontrado'});
    const isMatch= await bcrypt.compare(password, usuario.password);
    if(!isMatch) return res.status(401).json({message: 'Contraseña incorrecta'});
    res.status(200).json({mensaje: 'Login exitoso', usuario});
}
module.exports= {crearUsuario, login};