const pool = require('../config/db')

const crearAuditoria = async (req, res) => {
    try {
        const { id_movimiento, observaciones, estados_activos, id_aula, estado_general } = req.body
        const id_usuario_auditor = req.usuario.id

        const { rows } = await pool.query(`
            INSERT INTO auditoria (id_movimiento, id_usuario_auditor, observaciones, estados_activos, id_aula, estado_general)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `, [id_movimiento, id_usuario_auditor, observaciones, estados_activos ? JSON.stringify(estados_activos) : null, id_aula, estado_general ?? 'finalizada'])

        res.status(201).json({msg: "Auditoria creada exitosamente", datos: rows[0]})
    } catch (e) {
        console.log(e)
        res.status(500).json({ err: e })
    }
}

const verAuditorias = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT a.*, u.nombre_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, p.nombre as puesto, ar.nombre as area FROM auditoria a
            JOIN usuario u ON a.id_usuario_auditor = u.id_usuario
            JOIN puesto p ON u.id_puesto = p.id_puesto 
            JOIN area ar ON p.id_area = ar.id_area order by a.fecha_auditoria desc
        `)

        res.status(200).json({rows})
    } catch (e){
        console.log(e)
        res.status(500).json({err: e})
    }
}

const buscarAuditoriaId = async (req, res) => {
    try {
        const { id } = req.params

        const { rows } = await pool.query(`
            SELECT a.*, u.nombre_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, p.nombre as puesto, ar.nombre as area FROM auditoria a
            JOIN usuario u ON a.id_usuario_auditor = u.id_usuario
            JOIN puesto p ON u.id_puesto = p.id_puesto 
            JOIN area ar ON p.id_area = ar.id_area
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
        const { observaciones, estados_activos, id_aula, estado_general } = req.body

        const { rows } = await pool.query(`
            UPDATE auditoria SET
                observaciones = $1,
                estados_activos = $2,
                id_aula = $3,
                estado_general = $4
            WHERE id_auditoria = $5 RETURNING *
        `, [observaciones, estados_activos ? JSON.stringify(estados_activos) : null, id_aula, estado_general, id])

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