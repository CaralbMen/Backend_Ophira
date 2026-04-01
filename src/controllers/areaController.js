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
    const nombre_area = req.body?.nombre_area || req.body?.nombre;
    if(!nombre_area) return res.status(400).json({message: 'El nombre del área es requerido'});
    try{
        await pool.query('INSERT INTO area (nombre) VALUES ($1)', [nombre_area]);
        res.status(201).json({message: 'Área creada correctamente'});
    } catch (error) {
        console.error('Error al crear el área:', error);
        res.status(500).json({message: 'Error al crear el área'});
    }
}
const actualizarArea= async(req, res)=>{
    const id_area = Number(req.params.id_area);
    const nombre_area = req.body?.nombre_area || req.body?.nombre;

    if(!Number.isFinite(id_area)) return res.status(400).json({message: 'El id_area es invalido'});
    if(!nombre_area) return res.status(400).json({message: 'El nombre del área es requerido'});

    try{
        const result = await pool.query('UPDATE area SET nombre = $1 WHERE id_area = $2', [nombre_area, id_area]);
        if(result.rowCount === 0){
            return res.status(404).json({message: `No se encontró el área con id ${id_area}`});
        }
        res.status(200).json({message: 'Área actualizada correctamente'});
    } catch (error) {
        console.error('Error al actualizar el área:', error);
        res.status(500).json({message: 'Error al actualizar el área'});
    }
}
const eliminarArea= async(req, res)=>{
    const {nombre_area}= req.params;
    try{
        const area = await pool.query('SELECT id_area FROM area WHERE nombre = $1', [nombre_area]);
        if (area.rowCount === 0) {
            return res.status(404).json({message: `No se encontró el área ${nombre_area}`});
        }

        const puestosAsociados = await pool.query('SELECT count(*)::int as total FROM puesto WHERE id_area = $1', [area.rows[0].id_area]);
        if ((puestosAsociados.rows[0]?.total || 0) > 0) {
            return res.status(409).json({message: 'Error al eliminar área. Hay puestos asociados a esta área.'});
        }

        const result= await pool.query('DELETE FROM area WHERE nombre= $1', [nombre_area]);
        if(result.rowCount === 0){
            return res.status(404).json({message: `No se encontró el área ${nombre_area}`});
        }
        res.status(200).json({message: `Área ${nombre_area} eliminada correctamente`});
    } catch (error) {
        console.error('Error al eliminar el área:', error);
        res.status(500).json({message: 'Error al eliminar el área'});
    }
}
module.exports= { getAreas, crearArea, actualizarArea, eliminarArea}