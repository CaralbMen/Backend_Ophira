const pool= require('../config/db');

const obtenerRoles= async(req, res)=>{
    try{
        const result= await pool.query('select * from rol');
        if(result.rowCount===0){
            res.status(404).json({mensaje: 'No hay roles guardados', status: 404});
        }
        console.log(result);
        res.status(200).json({mensaje: 'Roles obtenidos', status:200, data: result});
    }catch(e){
        console.log('error: '+e);
        res.status(500).json({mensaje:'Error en el servidor', error: e});
    }
}
const registrarRol= async(req, res)=>{
    const {nombre, descripcion}= req.body;
    try{
        await pool.query('insert into rol (nombre, descripcion) values returning *',
            [nombre, descripcion]
        );
        console.log(`Datos insertados: \n${nombre}\n${descripcion}`);
        res.status(201).json({mensaje: 'Rol creado con éxito', status: 201});
    }catch(e){
        console.log(`error: ${e}`);
    }
}