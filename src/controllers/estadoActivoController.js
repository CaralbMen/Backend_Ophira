const pool = require('../config/db');

const getEstadosActivos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM estado_activo ORDER BY id_estado_activo ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los estados de activo:', error);
        res.status(500).json({ message: 'Error al obtener los estados de activo' });
    }
};

const crearEstadoActivo = async (req, res) => {
    const { nombre, color } = req.body;

    if (!nombre) return res.status(400).json({ message: 'El nombre del estado de activo es requerido' });

    try {
        const result = await pool.query(
            'INSERT INTO estado_activo (nombre, color) VALUES ($1, $2) RETURNING *',
            [nombre, color || null]
        );

        res.status(201).json({ message: 'Estado de activo creado correctamente', estado: result.rows[0] });
    } catch (error) {
        console.error('Error al crear el estado de activo:', error);
        res.status(500).json({ message: 'Error al crear el estado de activo' });
    }
};

const editarEstadoActivo = async (req, res) => {
    const { id } = req.params;
    const { nombre, color } = req.body;

    try {
        const existente = await pool.query('SELECT * FROM estado_activo WHERE id_estado_activo = $1', [id]);

        if (existente.rowCount === 0) {
            return res.status(404).json({ message: `No se encontro el estado de activo con id ${id}` });
        }

        const actual = existente.rows[0];
        const result = await pool.query(
            `UPDATE estado_activo
             SET nombre = $2,
                 color = $3
             WHERE id_estado_activo = $1
             RETURNING *`,
            [id, nombre || actual.nombre, color ?? actual.color]
        );

        res.status(200).json({ message: 'Estado de activo actualizado correctamente', estado: result.rows[0] });
    } catch (error) {
        console.error('Error al editar el estado de activo:', error);
        res.status(500).json({ message: 'Error al editar el estado de activo' });
    }
};

const eliminarEstadoActivo = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM estado_activo WHERE id_estado_activo = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: `No se encontro el estado de activo con id ${id}` });
        }

        res.status(200).json({ message: 'Estado de activo eliminado correctamente', estado: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar el estado de activo:', error);
        res.status(500).json({ message: 'Error al eliminar el estado de activo' });
    }
};

module.exports = { getEstadosActivos, crearEstadoActivo, editarEstadoActivo, eliminarEstadoActivo };