const pool = require('../config/db')

const VerMovimiento = async (req,res)=>{
    
    try{
        const {rows} = await pool.query(
            `SELECT maumu.*, u.*, a.nombre as Nombre_Activo FROM movimiento m JOIN movimineto_ubicacion mu on m.id_movimiento = mu.id_movimineto
            JOIN usuario u on m.id_usuario = u.id_usuario JOIN activo a on a.id_activo = m.id_activo
            JOIN aula al1 on mu.id_origen = al1.id_origen 
            JOIN aula al2 on mu.id_destino = al2.id.destino           
            `)

            res.status(200).json({msg:"Movimientos cargados con Exito",rows})
    }catch(e){
        res.status(400).json({e})
    }
        
    

}
module.exports = {VerMovimiento}