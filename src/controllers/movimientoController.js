const pool = require('../config/db')

const verMovimiento = async (req,res)=>{
    
    try{
        const {rows} = await pool.query(
            `SELECT m.*, u.*, a.nombre as Nombre_Activo FROM movimiento m JOIN movimineto_ubicacion mu on m.id_movimiento = mu.id_movimineto
            JOIN usuario u on m.id_usuario = u.id_usuario JOIN activo a on a.id_activo = m.id_activo
            JOIN aula al1 on mu.id_origen = al1.id_origen 
            JOIN aula al2 on mu.id_destino = al2.id.destino           
            `)

            res.status(200).json({msg:"Movimientos cargados con Exito",rows})
    }catch(e){
        res.status(400).json({e})
    }
}

const buscarMoviminetoID = async (req,res) =>{

    try{
        const {id} = req.params;

        const {rows} = await pool.query(
          `SELECT m.*, u.*, a.nombre as Nombre_Activo FROM movimiento m JOIN movimineto_ubicacion mu on m.id_movimiento = mu.id_movimineto
            JOIN usuario u on m.id_usuario = u.id_usuario JOIN activo a on a.id_activo = m.id_activo
            JOIN aula al1 on mu.id_origen = al1.id_origen 
            JOIN aula al2 on mu.id_destino = al2.id.destino
            WHERE m.id_movimiento = $1          
            `   ,
            [id]
        )
        if(rows.length === 0){
            return res.status(400).json({msg:"movimiento no encontrado"})
        }

        res.status(200).json({msg:"Movimiento encontrado",datos: rows[0]})

    }catch(e){
        res.status(400).json({e})
    }
}

const crearMovimiento = async (req,res) =>{

    try{
        const {id_movimiento, tipo_movimiento, fecha_movimiento, descripcion, id_usuario, id_activo} = req.body;
        
        const {rows} = await pool.query(`INSERT INTO movimiento (id_movimiento, tipo_movimiento,
             fecha_movimiento, descripcion, id_usuario, id_activo) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`
            ,
            [id_movimiento, tipo_movimiento, fecha_movimiento, descripcion, id_usuario, id_activo])

        res.status(201).json({msg:"movimiento crea<do exitosamente",datos: rows[0]})

    }catch(e){
         console.log(e)
        res.status(500).json({ err: e })
    }
}
const dropMovimiento = async (req,res) => {
    const id = req.params.id;
    try{
        const r = await pool.query('DELETE from movimiento WHERE id = $1 ',[id])

        if(r.rowCount === 0){
            return res.status(400).json({msg:'movimiento no encontrado'})
        }

        res.status(201).json({msg:"Se elimino el movimineto ", movimiento: r.rows[0]})

    }catch(e){
          console.log(e)
        res.status(500).json({ err: e })
    }
}

const editarMovimineto = async (req,res) => {
 const {tipo_movimiento, fecha_movimiento, descripcion, id_usuario, id_activo} = req.body;
 const id_movimiento = req.params.id;

    try{
        const {rows} = await pool.query('SELECT * FROM movimientos WHERE id_movimiento = $1',[id_movimiento])

        const movimiento = rows[0]

        if(rows.length === 0){
            return res.status(404).json({msg:"movimiento no encontrado"})
        }
       
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
            tipo_movimiento || movimiento.tipo_movimiento,
            fecha_movimiento || movimiento.fecha_movimiento,
            descripcion || movimiento.fecha_movimiento,
            id_usuario || movimiento.id_usuario,
            id_activo || movimiento.id_activo
        ])
        
        res.status(200).json({msg:"Movimiento actualizado exitosamente",movimiento: r.rows[0]})


    }catch(e){
        console.log(e)
         res.status(500).json({ err: e })

    }
}
module.exports = {verMovimiento,buscarMoviminetoID,crearMovimiento,dropMovimiento,editarMovimineto}