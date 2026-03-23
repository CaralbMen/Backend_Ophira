const pool = require('../config/db')

const crearAuditoria = async (req, res) => {
    try {
        const { id_movimiento, id_usuario_auditor, observaciones } = req.body

        const { rows } = await pool.query(`
            INSERT INTO auditoria (id_movimiento, id_usuario_auditor, observaciones)
            VALUES ($1, $2, $3) RETURNING *
        `, [id_movimiento, id_usuario_auditor, observaciones])

        res.status(201).json({msg: "Auditoria creada exitosamente", datos: rows[0]})
    } catch (e) {
        console.log(e)
        res.status(500).json({ err: e })
    }
}

const verAuditorias = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT a.*, u.nombre_usuario, u.nombre, u.apellido_paterno, u.apellido_materno  FROM auditoria a
            JOIN usuario u ON a.id_usuario_editor = u.id_usuario
            `)

        res.status(200).json({rows})
    } catch (e){
        console.log(e)
        res.status(500).json({err: e})
    }
}

const buscarAuditoriaId = async (req, res) => {
    try {
        const { id } = req.params.id

        const { rows } = await pool.query(`
            SELECT a.*, u.nombre_usuario, u.nombre, u.apellido_paterno, u.apellido_materno  FROM auditoria a
            JOIN usuario u ON a.id_usuario_editor = u.id_usuario
            WHERE a.id_auditoria = $1
        `, [id])

        if (rows.length === 0) {
            return res.status(404).json({msg: "Auditoria no encontrada"})
        }

        res.status(200).json({rows: rows[0]})
    } catch (e){
        console.log(e)
        res.status(500).json({err: e})
    }
}

const editarAuditoria = async (req, res) => {
    try {
        const { id } = req.params
        const { observaciones } = req.body

        const { rows } = await pool.query(`
            UPDATE auditoria SET observaciones = $1
            WHERE id_auditoria = $2 RETURNING *
        `, [observaciones, id])

        if (rows.length === 0) {
            return res.status(404).json({msg: "Auditoria no encontrada"})
        }

        res.status(200).json({ msg: "Auditoria actualizada", datos: rows[0] })
    } catch (e){
        console.log(e)
        res.status(500).json({err: e})
    }
}

const dropAuditoria = async (req, res) => {
    try {
        const { id } = req.params

        const { rowCount } = await pool.query(`DELETE FROM auditoria WHERE id_auditoria = $1`, [id])

        if (rowCount === 0) {
            return res.status(404).json({msg: "Auditoria no encontrada"})
        }

        res.status(200).json({msg: "Auditoria eliminada exitosamente"})
    } catch (e){
        console.log(e)
        res.status(500).json({err: e})
    }
}


module.exports = {verAuditorias, crearAuditoria, buscarAuditoriaId, editarAuditoria, dropAuditoria}