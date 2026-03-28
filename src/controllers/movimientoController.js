const pool = require('../config/db')

const verMovimiento = async (req,res)=>{
    try{
        const {rows} = await pool.query(`
            SELECT 
                m.*,
                u.nombre_usuario,
                a.nombre AS nombre_activo,
                al1.tipo AS origen,
                al2.tipo AS destino
            FROM movimiento m
            JOIN movimiento_ubicacion mu ON m.id_movimiento = mu.id_movimiento
            JOIN usuario u ON m.id_usuario = u.id_usuario
            JOIN activo a ON a.id_activo = m.id_activo
            JOIN aula al1 ON mu.id_aula_origen = al1.id_aula
            JOIN aula al2 ON mu.id_aula_destino = al2.id_aula
        `)

        res.status(200).json({msg:"Movimientos cargados con éxito",rows})
    }catch(e){
        console.log(e)
        res.status(500).json({e})
    }
}

const buscarMovimientoID = async (req,res) =>{
    try{
        const {id} = req.params;

        const {rows} = await pool.query(`
            SELECT 
                m.*,
                u.nombre_usuario,
                a.nombre AS nombre_activo,
                al1.tipo AS origen,
                al2.tipo AS destino
            FROM movimiento m
            JOIN movimiento_ubicacion mu ON m.id_movimiento = mu.id_movimiento
            JOIN usuario u ON m.id_usuario = u.id_usuario
            JOIN activo a ON a.id_activo = m.id_activo
            JOIN aula al1 ON mu.id_aula_origen = al1.id_aula
            JOIN aula al2 ON mu.id_aula_destino = al2.id_aula
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

const crearMovimiento = async (req,res) =>{
    try{
        const {
            tipo_movimiento,
            fecha_movimiento,
            descripcion,
            id_usuario,
            id_activo,
            id_aula_origen,
            id_aula_destino
        } = req.body;

        if (!tipo_movimiento) return res.status(400).json({msg:"Tipo obligatorio"})
        if (!id_usuario) return res.status(400).json({msg:"Usuario obligatorio"})
        if (!id_activo) return res.status(400).json({msg:"Activo obligatorio"})
        if (!id_aula_origen) return res.status(400).json({msg:"Aula origen obligatoria"})
        if (!id_aula_destino) return res.status(400).json({msg:"Aula destino obligatoria"})

        await pool.query('BEGIN')

        const {rows} = await pool.query(`

            INSERT INTO movimiento 
            (tipo_movimiento, fecha_movimiento, descripcion, id_usuario, id_activo) 
            VALUES ($1,$2,$3,$4,$5) RETURNING *
        `,
        [tipo_movimiento, fecha_movimiento, descripcion, id_usuario, id_activo])


         const id_movimiento = rows[0].id_movimiento

        await pool.query(`
            INSERT INTO movimiento_ubicacion
            (id_movimiento, id_aula_origen, id_aula_destino)
            VALUES ($1, $2, $3)
        `,
        [id_movimiento, id_aula_origen, id_aula_destino])

        await pool.query('COMMIT')
        res.status(201).json({msg:"Movimiento creado exitosamente",datos: rows[0]})

    }catch(e){
        await pool.query('ROLLBACK')
        console.log(e)
        res.status(500).json({ err: e })
    }
}

const dropMovimiento = async (req,res) => {
    const id = req.params.id;
    try{
        const r = await pool.query(
            'DELETE FROM movimiento WHERE id_movimiento = $1 RETURNING *',
            [id]
        )

        if(r.rowCount === 0){
            return res.status(404).json({msg:'Movimiento no encontrado'})
        }

        res.status(200).json({msg:"Movimiento eliminado", movimiento: r.rows[0]})

    }catch(e){
        console.log(e)
        res.status(500).json({ err: e })
    }
}

const editarMovimiento = async (req,res) => {
    const {tipo_movimiento, fecha_movimiento, descripcion, id_usuario, id_activo} = req.body;
    const id_movimiento = req.params.id;

    try{
        const {rows} = await pool.query(
            'SELECT * FROM movimiento WHERE id_movimiento = $1',
            [id_movimiento]
        )

        if(rows.length === 0){
            return res.status(404).json({msg:"Movimiento no encontrado"})
        }

        const movimiento = rows[0]

        const r = await pool.query(`
            UPDATE movimiento SET
            tipo_movimiento = $2,
            fecha_movimiento = $3,
            descripcion = $4,
            id_usuario = $5,
            id_activo = $6
            WHERE id_movimiento = $1 RETURNING *
        `,
        [
            id_movimiento,
            tipo_movimiento ?? movimiento.tipo_movimiento,
            fecha_movimiento ?? movimiento.fecha_movimiento,
            descripcion ?? movimiento.descripcion,
            id_usuario ?? movimiento.id_usuario,
            id_activo ?? movimiento.id_activo
        ])

        res.status(200).json({msg:"Movimiento actualizado",movimiento: r.rows[0]})

    }catch(e){
        console.log(e)
        res.status(500).json({ err: e })
    }
}

module.exports = {verMovimiento,buscarMovimientoID,crearMovimiento,dropMovimiento,editarMovimiento}