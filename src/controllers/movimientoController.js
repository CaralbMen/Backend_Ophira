const pool = require('../config/db')

const capitalizarPrimera = (valor = '') => {
    const limpio = String(valor || '').trim()
    if (!limpio) return ''
    return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase()
}

const verMovimiento = async (req,res)=>{
    try{
        const {rows} = await pool.query(`
            SELECT 
                m.*,
                u.nombre_usuario,
                u.apellido_paterno,
                p.nombre AS puesto,
                ar.nombre AS area,
                a.nombre AS nombre_activo
            FROM movimiento m
            JOIN usuario u ON m.id_usuario = u.id_usuario
            LEFT JOIN puesto p ON u.id_puesto = p.id_puesto
            LEFT JOIN area ar ON p.id_area = ar.id_area
            JOIN activo a ON a.id_activo = m.id_activo
            ORDER BY m.id_movimiento DESC
        `)

        res.status(200).json({msg:"Movimientos cargados con éxito",rows})
    }catch(e){
        console.log(e)
        res.status(500).json({e})
    }
}

const verMovimientoPorTipo = async (req,res)=>{
    try{
        const {tipo} = req.params

        const {rows} = await pool.query(`
            SELECT 
                m.*,
                u.nombre_usuario,
                a.nombre AS nombre_activo
            FROM movimiento m
            JOIN usuario u ON m.id_usuario = u.id_usuario
            JOIN activo a ON a.id_activo = m.id_activo
            WHERE LOWER(m.tipo_movimiento) = LOWER($1)
            ORDER BY m.id_movimiento DESC
        `,[tipo])

        if(rows.length === 0){
            return res.status(404).json({msg:"No hay movimientos de este tipo"})
        }

        res.status(200).json({rows})
    }catch(e){
        console.log(e)
        res.status(500).json({err:e})
    }
}

const verMovimientoPorActivo = async (req,res)=>{
    try{
        const {id} = req.params

        const {rows} = await pool.query(`
            SELECT 
                m.*,
                u.nombre_usuario,
                a.nombre AS nombre_activo
            FROM movimiento m
            JOIN usuario u ON m.id_usuario = u.id_usuario
            JOIN activo a ON a.id_activo = m.id_activo
            WHERE m.id_activo = $1
            ORDER BY m.id_movimiento DESC
        `,[id])

        if(rows.length === 0){
            return res.status(404).json({msg:"No hay movimientos para este activo"})
        }

        res.status(200).json({rows})
    }catch(e){
        console.log(e)
        res.status(500).json({err:e})
    }
}

const verMovimientoPorUsuario = async (req,res)=>{
    try{
        const {id} = req.params

        const {rows} = await pool.query(`
            SELECT 
                m.*,
                u.nombre_usuario,
                a.nombre AS nombre_activo
            FROM movimiento m
            JOIN usuario u ON m.id_usuario = u.id_usuario
            JOIN activo a ON a.id_activo = m.id_activo
            WHERE m.id_usuario = $1
            ORDER BY m.id_movimiento DESC
        `,[id])

        if(rows.length === 0){
            return res.status(404).json({msg:"No hay movimientos para este usuario"})
        }

        res.status(200).json({rows})
    }catch(e){
        console.log(e)
        res.status(500).json({err:e})
    }
}

const buscarMovimientoID = async (req,res)=>{
    try{
        const {id} = req.params

        const {rows} = await pool.query(`
            SELECT 
                m.*,
                u.nombre_usuario,
                a.nombre AS nombre_activo
            FROM movimiento m
            JOIN usuario u ON m.id_usuario = u.id_usuario
            JOIN activo a ON a.id_activo = m.id_activo
            WHERE m.id_movimiento = $1
        `,[id])

        if(rows.length === 0){
            return res.status(404).json({msg:"Movimiento no encontrado"})
        }

        res.status(200).json({msg:"Movimiento encontrado",datos: rows[0]})

    }catch(e){
        console.log(e)
        res.status(500).json({e})
    }
}

const crearMovimiento = async (req,res)=>{
    try{
        const {
            tipo_movimiento,
            fecha_movimiento,
            descripcion,
            id_usuario,
            id_activo
        } = req.body

        const tipoMovimientoNormalizado = capitalizarPrimera(tipo_movimiento)
        const tipoMovimientoClave = tipoMovimientoNormalizado.toLowerCase()

        if (!tipoMovimientoNormalizado) return res.status(400).json({msg:"Tipo obligatorio"})
        if (!id_usuario) return res.status(400).json({msg:"Usuario obligatorio"})
        if (!id_activo) return res.status(400).json({msg:"Activo obligatorio"})

        await pool.query('BEGIN')

        const {rows} = await pool.query(`
            INSERT INTO movimiento 
            (tipo_movimiento, fecha_movimiento, descripcion, id_usuario, id_activo) 
            VALUES ($1,$2,$3,$4,$5) RETURNING *
        `,[
            tipoMovimientoNormalizado,
            fecha_movimiento,
            descripcion,
            id_usuario,
            id_activo
        ])

        const id_movimiento = rows[0].id_movimiento

        switch(tipoMovimientoClave){

            case 'escaneo': {
                // El tipo escaneo no requiere tabla de detalle adicional.
            }
            break

            case 'ubicacion': {
                const { id_aula_origen, id_aula_destino } = req.body

                if (!id_aula_origen || !id_aula_destino){
                    throw new Error("Datos incompletos")
                }

                await pool.query(`
                    INSERT INTO movimiento_ubicacion
                    (id_movimiento, id_aula_origen, id_aula_destino)
                    VALUES ($1, $2, $3)
                `,[id_movimiento, id_aula_origen, id_aula_destino])
            }
            break

            case 'depreciacion': {
                const { valor_depreciado, valor_restante, id_metodo_depreciacion } = req.body

                if (!valor_depreciado || !valor_restante || !id_metodo_depreciacion){
                    throw new Error("Datos incompletos")
                }

                await pool.query(`
                    INSERT INTO movimiento_depreciacion
                    (id_movimiento, valor_depreciado, valor_restante, id_metodo_depreciacion)
                    VALUES ($1,$2,$3,$4)
                `,[id_movimiento, valor_depreciado, valor_restante, id_metodo_depreciacion])
            }
            break

            case 'baja': {
                const { motivo_baja } = req.body

                if (!motivo_baja){
                    throw new Error("Datos incompletos")
                }

                await pool.query(`
                    INSERT INTO movimiento_baja
                    (id_movimiento, motivo_baja)
                    VALUES ($1,$2)
                `,[id_movimiento, motivo_baja])
            }
            break

            case 'actualizacion': {
                const { campo_modificado, valor_anterior, valor_nuevo, justificacion } = req.body

                if (!campo_modificado || !valor_nuevo){
                    throw new Error("Datos incompletos")
                }

                await pool.query(`
                    INSERT INTO movimiento_actualizacion
                    (id_movimiento, campo_modificado, valor_anterior, valor_nuevo, justificacion)
                    VALUES ($1,$2,$3,$4,$5)
                `,[id_movimiento, campo_modificado, valor_anterior, valor_nuevo, justificacion])
            }
            break

            default:
                throw new Error("Tipo de movimiento no válido")
        }

        await pool.query('COMMIT')

        res.status(201).json({
            msg:"Movimiento creado exitosamente",
            datos: rows[0]
        })

    }catch(e){
        await pool.query('ROLLBACK')
        console.log(e)
        res.status(500).json({err: e.message})
    }
}

const dropMovimiento = async (req,res)=>{
    const id = req.params.id
    try{
        await pool.query('BEGIN')

        await pool.query('DELETE FROM movimiento_ubicacion WHERE id_movimiento = $1',[id])
        await pool.query('DELETE FROM movimiento_depreciacion WHERE id_movimiento = $1',[id])
        await pool.query('DELETE FROM movimiento_baja WHERE id_movimiento = $1',[id])
        await pool.query('DELETE FROM movimiento_actualizacion WHERE id_movimiento = $1',[id])

        const r = await pool.query(
            'DELETE FROM movimiento WHERE id_movimiento = $1 RETURNING *',
            [id]
        )

        if(r.rowCount === 0){
            await pool.query('ROLLBACK')
            return res.status(404).json({msg:'Movimiento no encontrado'})
        }

        await pool.query('COMMIT')

        res.status(200).json({msg:"Movimiento eliminado", movimiento: r.rows[0]})

    }catch(e){
        await pool.query('ROLLBACK')
        console.log(e)
        res.status(500).json({err:e})
    }
}

const editarMovimiento = async (req,res)=>{
    const {tipo_movimiento, fecha_movimiento, descripcion, id_usuario, id_activo} = req.body
    const id_movimiento = req.params.id

    try{
        const {rows} = await pool.query(
            'SELECT * FROM movimiento WHERE id_movimiento = $1',
            [id_movimiento]
        )

        if(rows.length === 0){
            return res.status(404).json({msg:"Movimiento no encontrado"})
        }

        const movimiento = rows[0]
        const tipoNormalizado = tipo_movimiento
            ? capitalizarPrimera(tipo_movimiento)
            : movimiento.tipo_movimiento

        const r = await pool.query(`
            UPDATE movimiento SET
            tipo_movimiento = $2,
            fecha_movimiento = $3,
            descripcion = $4,
            id_usuario = $5,
            id_activo = $6
            WHERE id_movimiento = $1 RETURNING *
        `,[
            id_movimiento,
            tipoNormalizado,
            fecha_movimiento ?? movimiento.fecha_movimiento,
            descripcion ?? movimiento.descripcion,
            id_usuario ?? movimiento.id_usuario,
            id_activo ?? movimiento.id_activo
        ])

        res.status(200).json({msg:"Movimiento actualizado",movimiento: r.rows[0]})

    }catch(e){
        console.log(e)
        res.status(500).json({err:e})
    }
}

module.exports = {
    verMovimiento,
    verMovimientoPorTipo,
    verMovimientoPorActivo,
    verMovimientoPorUsuario,
    buscarMovimientoID,
    crearMovimiento,
    dropMovimiento,
    editarMovimiento
}