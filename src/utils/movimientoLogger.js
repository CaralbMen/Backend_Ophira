const pool = require('../config/db');

const resolverActivoParaMovimiento = async (idUsuario, db = pool) => {
    if (!idUsuario) {
        return null;
    }

    const porResponsable = await db.query(
        'SELECT id_activo FROM activo WHERE id_responsable = $1 ORDER BY fecha_registro DESC, id_activo DESC LIMIT 1',
        [idUsuario]
    );

    if (porResponsable.rows.length > 0) {
        return porResponsable.rows[0].id_activo;
    }

    const cualquiera = await db.query(
        'SELECT id_activo FROM activo ORDER BY id_activo ASC LIMIT 1'
    );

    if (cualquiera.rows.length > 0) {
        return cualquiera.rows[0].id_activo;
    }

    return null;
};

const registrarMovimientoActualizacion = async ({
    idUsuario,
    idActivo,
    descripcion,
    campoModificado,
    valorAnterior,
    valorNuevo,
    justificacion,
    db = pool,
}) => {
    if (!idUsuario || !idActivo) {
        return null;
    }

    const movimiento = await db.query(
        `INSERT INTO movimiento (tipo_movimiento, descripcion, id_usuario, id_activo)
         VALUES ('actualizacion', $1, $2, $3)
         RETURNING id_movimiento`,
        [descripcion || 'Actualizacion del sistema', idUsuario, idActivo]
    );

    const idMovimiento = movimiento.rows[0].id_movimiento;

    await db.query(
        `INSERT INTO movimiento_actualizacion
         (id_movimiento, campo_modificado, valor_anterior, valor_nuevo, justificacion)
         VALUES ($1, $2, $3, $4, $5)`,
        [
            idMovimiento,
            campoModificado || 'sistema',
            valorAnterior ?? null,
            valorNuevo ?? null,
            justificacion ?? null,
        ]
    );

    return idMovimiento;
};

module.exports = {
    resolverActivoParaMovimiento,
    registrarMovimientoActualizacion,
};
