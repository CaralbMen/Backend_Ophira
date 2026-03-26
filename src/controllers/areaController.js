const pool = require('../config/db');

const getAreas= async(req, res)=>{
    try{
        const result= await pool.query('SELECT * FROM area');
        res.status(200).json(result.rows);
    }catch (error) {
        console.error('Error al obtener las áreas:', error);
        res.status(500).json({message: 'Error al obtener las áreas'});
    }
}
const crearArea= async(req, res)=>{
    const {nombre_area}= req.body;
    if(!nombre_area) return res.status(400).json({message: 'El nombre del área es requerido'});
    try{
        await pool.query('INSERT INTO area (nombre_area) VALUES ($1)', [nombre_area]);
        res.status(201).json({message: 'Área creada correctamente'});
    } catch (error) {
        console.error('Error al crear el área:', error);
        res.status(500).json({message: 'Error al crear el área'});
    }
}
const eliminarArea= async(req, res)=>{
    const {nombre_area}= req.params.nombre_area;
    try{
        const result= await pool.query('DELETE FROM area WHERE nombre_area= $1', [nombre_area]);
        if(result.rowCount === 0){
            return res.status(404).json({message: `No se encontró el área ${nombre_area}`});
        }
        res.status(200).json({message: `Área ${nombre_area} eliminada correctamente`});
    } catch (error) {
        console.error('Error al eliminar el área:', error);
        res.status(500).json({message: 'Error al eliminar el área'});
    }
}
module.exports= { getAreas, crearArea, eliminarArea}