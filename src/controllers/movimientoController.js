const pool = require('../config/db')

const VerMovimiento = async (req,res)=>{
    
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

const BuscarMoviminetoID = async (req,res) =>{

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

const CrearMovimiento = async (req,res) =>{

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
module.exports = {VerMovimiento,BuscarMoviminetoID,CrearMovimiento}