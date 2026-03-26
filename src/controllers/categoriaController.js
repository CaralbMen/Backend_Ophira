const pool = require('../config/db');

const getCategorias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categoria ORDER BY id_categoria ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener las categorias:', error);
        res.status(500).json({ message: 'Error al obtener las categorias' });
    }
};

const crearCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;

    if (!nombre) return res.status(400).json({ message: 'El nombre de la categoria es requerido' });

    try {
        const result = await pool.query(
            'INSERT INTO categoria (nombre, descripcion) VALUES ($1, $2) RETURNING *',
            [nombre, descripcion || null]
        );

        res.status(201).json({ message: 'Categoria creada correctamente', categoria: result.rows[0] });
    } catch (error) {
        console.error('Error al crear la categoria:', error);
        res.status(500).json({ message: 'Error al crear la categoria' });
    }
};

const editarCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    try {
        const existente = await pool.query('SELECT * FROM categoria WHERE id_categoria = $1', [id]);

        if (existente.rowCount === 0) {
            return res.status(404).json({ message: `No se encontro la categoria con id ${id}` });
        }

        const actual = existente.rows[0];
        const result = await pool.query(
            `UPDATE categoria
             SET nombre = $2,
                 descripcion = $3
             WHERE id_categoria = $1
             RETURNING *`,
            [id, nombre || actual.nombre, descripcion ?? actual.descripcion]
        );

        res.status(200).json({ message: 'Categoria actualizada correctamente', categoria: result.rows[0] });
    } catch (error) {
        console.error('Error al editar la categoria:', error);
        res.status(500).json({ message: 'Error al editar la categoria' });
    }
};

const eliminarCategoria = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM categoria WHERE id_categoria = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: `No se encontro la categoria con id ${id}` });
        }

        res.status(200).json({ message: 'Categoria eliminada correctamente', categoria: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar la categoria:', error);
        res.status(500).json({ message: 'Error al eliminar la categoria' });
    }
};

module.exports = { getCategorias, crearCategoria, editarCategoria, eliminarCategoria };