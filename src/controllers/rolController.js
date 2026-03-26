const pool= require('../config/db');

const obtenerRoles= async(req, res)=>{
    try{
        const result= await pool.query('select * from rol');
        if(result.rowCount===0){
            res.status(404).json({mensaje: 'No hay roles guardados', codigo: 404});
        }
        console.log(result);
        
        res.status(200).json(result.rows);
    }catch(e){
        console.log('error: '+e);
        res.status(500).json({mensaje:'Error en el servidor', error: e});
    }
}
const registrarRol= async(req, res)=>{
    const {nombre, descripcion}= req.body;
    try{
        await pool.query('insert into rol (nombre, descripcion) values ($1, $2)',
            [nombre, descripcion]
        );
        console.log(`Datos insertados: \n${nombre}\n${descripcion}`);
        res.status(201).json({mensaje: 'Rol creado con éxito', codigo: 201});
    }catch(e){
        console.log(`error: ${e}`);
        res.status(500).json({mensaje: 'Error en el servidor', codigo: 500, error: e});
    }
}
const editarRol= async(req, res)=>{
    const {nombreNuevo, descripcion}= req.body;
    const nombre= req.params.nombre;
    try{
        const rol= await pool.query('select * from rol where nombre= $1', [nombre]);
        if(rol.rows.length === 0){
            return res.status(404).json({mensaje: `No se encontró el rol ${nombre}`, codigo: 404});
        }
        if(nombreNuevo) rol.rows[0].nombre= nombreNuevo;
        if(descripcion) rol.rows[0].descripcion= descripcion;

        const result= await pool.query('update rol set nombre= $1, descripcion= $2 where nombre= $3',
            [rol.rows[0].nombre, rol.rows[0].descripcion, nombre]
        )
        if(result.affectedRows===0){
            res.status(404).json({mensaje: `No se encontró el rol ${nombre}`, codigo: 404});
        }
        res.status(200).json({mensaje: `Rol ${nombre} actualizado correctamente`, codigo: 200});
    }catch(e){
        console.log(`Error ${e}`);
        res.status(500).json({mensaje:`Error en el servidor al modificar los datos`, codigo: 500, error:e});
    }
}
const eliminaRol= async(req, res)=>{
    const nombre= req.params.nombre;
    try{
        const result= await pool.query('delete from rol where nombre= $1', [nombre]);
        if(result.affectedRows===0){
            res.status(404).json({mensaje: `No se encontró el rol ${nombre}`, codigo: 404});
        }
        res.status(200).json({mensaje: `Rol ${nombre} eliminado correctamente`, codigo: 200});
    }catch(e){
        console.log(`Error al eliminar Rol: ${e}`);
        res.status(500).json({mensaje: 'Error en el servidor al eliminar rol', codigo: 500, error: e});
    }
}

module.exports = {obtenerRoles, registrarRol, editarRol, eliminaRol};