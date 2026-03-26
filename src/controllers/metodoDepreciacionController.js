const pool = require('../config/db');

const getMetodosDepreciacion = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM metodo_depreciacion ORDER BY id_metodo_depreciacion ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los metodos de depreciacion:', error);
        res.status(500).json({ message: 'Error al obtener los metodos de depreciacion' });
    }
};

const crearMetodoDepreciacion = async (req, res) => {
    const { nombre, descripcion, parametros } = req.body;

    if (!nombre) return res.status(400).json({ message: 'El nombre del metodo de depreciacion es requerido' });
    if (!parametros) return res.status(400).json({ message: 'Los parametros del metodo son requeridos' });

    try {
        const result = await pool.query(
            'INSERT INTO metodo_depreciacion (nombre, descripcion, parametros) VALUES ($1, $2, $3) RETURNING *',
            [nombre, descripcion || null, parametros]
        );

        res.status(201).json({ message: 'Metodo de depreciacion creado correctamente', metodo: result.rows[0] });
    } catch (error) {
        console.error('Error al crear el metodo de depreciacion:', error);
        res.status(500).json({ message: 'Error al crear el metodo de depreciacion' });
    }
};

const editarMetodoDepreciacion = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, parametros } = req.body;

    try {
        const existente = await pool.query('SELECT * FROM metodo_depreciacion WHERE id_metodo_depreciacion = $1', [id]);

        if (existente.rowCount === 0) {
            return res.status(404).json({ message: `No se encontro el metodo de depreciacion con id ${id}` });
        }

        const actual = existente.rows[0];
        const result = await pool.query(
            `UPDATE metodo_depreciacion
             SET nombre = $2,
                 descripcion = $3,
                 parametros = $4
             WHERE id_metodo_depreciacion = $1
             RETURNING *`,
            [id, nombre || actual.nombre, descripcion ?? actual.descripcion, parametros || actual.parametros]
        );

        res.status(200).json({ message: 'Metodo de depreciacion actualizado correctamente', metodo: result.rows[0] });
    } catch (error) {
        console.error('Error al editar el metodo de depreciacion:', error);
        res.status(500).json({ message: 'Error al editar el metodo de depreciacion' });
    }
};

const eliminarMetodoDepreciacion = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM metodo_depreciacion WHERE id_metodo_depreciacion = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: `No se encontro el metodo de depreciacion con id ${id}` });
        }

        res.status(200).json({ message: 'Metodo de depreciacion eliminado correctamente', metodo: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar el metodo de depreciacion:', error);
        res.status(500).json({ message: 'Error al eliminar el metodo de depreciacion' });
    }
};

module.exports = {
    getMetodosDepreciacion,
    crearMetodoDepreciacion,
    editarMetodoDepreciacion,
    eliminarMetodoDepreciacion
};