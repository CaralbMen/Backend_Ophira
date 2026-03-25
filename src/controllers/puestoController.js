const pool= require('../config/db');

const obtenerPuestos= async(req, res)=>{
    try{
        const result= await pool.query('select * from puesto');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los puestos:', error);
        res.status(500).json({message: 'Error al obtener los puestos'});
    }
}
const crearPuesto= async(req, res)=>{
    const {nombre_puesto, id_area}= req.body;
    if(!nombre_puesto) return res.status(400).json({message: 'El nombre del puesto es requerido'});
    if(!id_area) return res.status(400).json({message: 'El ID del área es requerido'});
    try{
        await pool.query('INSERT INTO puesto (nombre, id_area) VALUES ($1, $2)', [nombre_puesto, id_area]);
        res.status(201).json({message: 'Puesto creado correctamente'});
    } catch (error) {
        console.error('Error al crear el puesto:', error);
        res.status(500).json({message: 'Error al crear el puesto'});
    }
}
const eliminarPuesto= async(req, res)=>{
    const {nombre_puesto}= req.params.nombre_puesto;
    try{
        const result= await pool.query('DELETE FROM puesto WHERE nombre= $1', [nombre_puesto]);
        if(result.rowCount === 0){
            return res.status(404).json({message: `No se encontró el puesto ${nombre_puesto}`});
        }
        res.status(200).json({message: `Puesto ${nombre_puesto} eliminado correctamente`});
    } catch (error) {
        console.error('Error al eliminar el puesto:', error);
        res.status(500).json({message: 'Error al eliminar el puesto'});
    }
}
module.exports= { obtenerPuestos, crearPuesto, eliminarPuesto }