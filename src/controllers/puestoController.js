const pool= require('../config/db');

const obtenerPuestos= async(req, res)=>{
    try{
        const result= await pool.query('select p.*, a.nombre as nombre_area from puesto p join area a on p.id_area = a.id_area order by p.id_puesto');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los puestos:', error);
        res.status(500).json({message: 'Error al obtener los puestos'});
    }
}
const crearPuesto= async(req, res)=>{
    const nombre = req.body?.nombre || req.body?.nombre_puesto;
    const {id_area}= req.body;
    if(!nombre) return res.status(400).json({message: 'El nombre del puesto es requerido'});
    if(!id_area) return res.status(400).json({message: 'El ID del área es requerido'});
    try{
        await pool.query('INSERT INTO puesto (nombre, id_area) VALUES ($1, $2)', [nombre, id_area]);
        res.status(201).json({message: 'Puesto creado correctamente'});
    } catch (error) {
        console.error('Error al crear el puesto:', error);
        res.status(500).json({message: 'Error al crear el puesto'});
    }
}
const actualizarPuesto= async(req, res)=>{
    const id_puesto = Number(req.params.id_puesto);
    const nombre = req.body?.nombre || req.body?.nombre_puesto;
    const id_area = Number(req.body?.id_area);

    if(!Number.isFinite(id_puesto)) return res.status(400).json({message: 'El id_puesto es invalido'});
    if(!nombre) return res.status(400).json({message: 'El nombre del puesto es requerido'});
    if(!Number.isFinite(id_area)) return res.status(400).json({message: 'El id_area es invalido'});

    try{
        const result = await pool.query('UPDATE puesto SET nombre = $1, id_area = $2 WHERE id_puesto = $3', [nombre, id_area, id_puesto]);
        if(result.rowCount === 0){
            return res.status(404).json({message: `No se encontró el puesto con id ${id_puesto}`});
        }
        res.status(200).json({message: 'Puesto actualizado correctamente'});
    } catch (error) {
        console.error('Error al actualizar el puesto:', error);
        res.status(500).json({message: 'Error al actualizar el puesto'});
    }
}
const eliminarPuesto= async(req, res)=>{
    const {nombre_puesto}= req.params;
    try{
        const puesto = await pool.query('SELECT id_puesto FROM puesto WHERE nombre = $1', [nombre_puesto]);
        if (puesto.rowCount === 0) {
            return res.status(404).json({message: `No se encontró el puesto ${nombre_puesto}`});
        }

        const usuariosAsignados = await pool.query('SELECT count(*)::int as total FROM usuario WHERE id_puesto = $1', [puesto.rows[0].id_puesto]);
        if ((usuariosAsignados.rows[0]?.total || 0) > 0) {
            return res.status(409).json({message: 'Error al eliminar puesto. Hay usuarios asignados a este puesto.'});
        }

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
module.exports= { obtenerPuestos, crearPuesto, actualizarPuesto, eliminarPuesto }