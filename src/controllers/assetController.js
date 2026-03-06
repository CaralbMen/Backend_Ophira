const pool = require('../config/db')

const crearActivo = async (req, res) => {
    const datos = req.body
    try {
        if (!datos.nombre) { return res.status(400).json({msg: "El nombre no puede estar vacío"}) }
        if (!datos.descripcion) { return res.status(400).json({msg: "La descripción no puede estar vacía"}) }
        if (!datos.modelo) { return res.status(400).json({msg: "El modelo no puede estar vacío"}) }
        if (!datos.numero_serie) { return res.status(400).json({msg: "El número de serie no puede estar vacío"}) }
        if (!datos.fecha_compra) { return res.status(400).json({msg: "La fecha de compra no puede estar vacía"}) }
        if (!datos.precio_compra) { return res.status(400).json({msg: "El precio de compra no puede estar vacío"}) }
        if (!datos.id_categoria) { return res.status(400).json({msg: "La categoría no puede estar vacía"}) }
        if (!datos.id_estado_activo) { return res.status(400).json({msg: "El estado no puede estar vacío"}) }
        if (!datos.id_aula) { return res.status(400).json({msg: "La aula no puede estar vacía"}) }

        const {rows} = await pool.query(`INSERT INTO activo 
            (nombre, descripcion, modelo, numero_serie, fecha_compra, precio_compra, id_categoria, id_estado_activo, id_aula)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, 
        [datos.nombre, datos.descripcion, datos.modelo, datos.numero_serie, datos.fecha_compra, 
        datos.precio_compra, datos.id_categoria, datos.id_estado_activo, datos.id_aula])
        
        res.status(200).json({msg: "Datos insertados exitosamente", datos: rows})


    } catch (e){
        console.log(e)
        res.status(500).json({err: error})
    }
}

const verActivos = async(req, res) => { // ver TODOS los activos
    try{
        const { rows } = await pool.query(`SELECT *, c.nombre, au.nombre, e.nombre  FROM activo a
            JOIN categoria c ON a.id_categoria = c.id_categoria
            JOIN estado_activo e ON a.id_estado_activo = e.id_estado_activo
            JOIN aula au ON a.id_aula = au.id_aula
            `)

        res.status(200).json[{rows}]
    } catch (e){
        console.log(e)
        res.status(500).json({err: error})
    }
}

const buscarActivoId = async(req, res) => { // buscar activo por ID
    const id = req.params.id;
    try{
        const { rows } = await pool.query(`SELECT *, c.nombre, au.nombre, e.nombre  FROM activo a
            JOIN categoria c ON a.id_categoria = c.id_categoria
            JOIN estado_activo e ON a.id_estado_activo = e.id_estado_activo
            JOIN aula au ON a.id_aula = au.id_aula
            WHERE a.id_activo = $1
            `, [id])

        if (rows.length == 0){
            return res.status(404).json({msg: "Activo no encontrado"})
        }

        res.status(200).json[{rows}]
    } catch (e){
        console.log(e)
        res.status(500).json({err: error})
    }
}

const buscarActivoNombre = async(req, res) => { // buscar activo por NOMBRE
    const nombre = req.params.nombre;
    try{
        const { rows } = await pool.query(`SELECT *, c.nombre, au.nombre, e.nombre  FROM activo a
            JOIN categoria c ON a.id_categoria = c.id_categoria
            JOIN estado_activo e ON a.id_estado_activo = e.id_estado_activo
            JOIN aula au ON a.id_aula = au.id_aula
            WHERE a.nombre = $1
            `, [nombre])

        if (rows.length == 0){
            return res.status(404).json({msg: "Activo no encontrado"})
        }

        res.status(200).json[{rows}]
    } catch (e){
        console.log(e)
        res.status(500).json({err: error})
    }
}

module.exports = { crearActivo, verActivos, buscarActivoId, buscarActivoNombre }