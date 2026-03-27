const pool = require('../config/db')

const crearActivo = async (req, res) => {
    const datos = req.body
    console.log(`Datos recibidos: ${JSON.stringify(datos)}`)
    try {
        if (!datos.nombre) { return res.status(400).json({msg: "El nombre no puede estar vacío"}) }
        if (!datos.descripcion) { return res.status(400).json({msg: "La descripción no puede estar vacía"}) }
        if (!datos.modelo) { return res.status(400).json({msg: "El modelo no puede estar vacío"}) }
        if (!datos.numero_serie) { return res.status(400).json({msg: "El número de serie no puede estar vacío"}) }
        if (!datos.fecha_compra) { return res.status(400).json({msg: "La fecha de compra no puede estar vacía"}) }
        if (!datos.precio_compra) { return res.status(400).json({msg: "El precio de compra no puede estar vacío"}) }
        if(!datos.valor_actual) { return res.status(400).json({msg: "El valor actual no puede estar vacío"}) }

        if(!datos.valor_residual) { return res.status(400).json({msg: "El valor residual no puede estar vacío"}) }
        if(!datos.vida_util_anios) { return res.status(400).json({msg: "La vida útil no puede estar vacía"}) }    
        if(!datos.id_metodo_depreciacion) { return res.status(400).json({msg: "El método de depreciación no puede estar vacío"}) }
        if (!datos.id_categoria) { return res.status(400).json({msg: "La categoría no puede estar vacía"}) }
        if (!datos.id_estado_activo) { return res.status(400).json({msg: "El estado no puede estar vacío"}) }
        if (!datos.id_aula) { return res.status(400).json({msg: "La aula no puede estar vacía"}) }

        const {rows} = await pool.query(`INSERT INTO activo 
            (nombre, descripcion, modelo, numero_serie, fecha_compra, precio_compra, valor_actual, valor_residual, vida_util_anios, id_metodo_depreciacion, id_categoria, id_estado_activo, id_aula)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
            `, 
        [datos.nombre, datos.descripcion, datos.modelo, datos.numero_serie, datos.fecha_compra, 
        datos.precio_compra, datos.valor_actual, datos.valor_residual, datos.vida_util_anios, datos.id_metodo_depreciacion, datos.id_categoria, datos.id_estado_activo, datos.id_aula])
        
        res.status(200).json({msg: "Datos insertados exitosamente", datos: rows, codigo: 200})


    } catch (e){
        console.log(e)
        res.status(500).json({err: e})
    }
}

const verActivos = async(req, res) => { // ver TODOS los activos
    try{
        const { rows } = await pool.query(`SELECT *, c.nombre, a.nombre, e.nombre  FROM activo a
            JOIN categoria c ON a.id_categoria = c.id_categoria
            JOIN estado_activo e ON a.id_estado_activo = e.id_estado_activo
            JOIN aula au ON a.id_aula = au.id_aula
            `)

        res.status(200).json({ rows })
    } catch (e){
        console.log(e)
        res.status(500).json({err: e})
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

        res.status(200).json({rows, codigo: 200})
    } catch (e){
        console.log(e)
        res.status(500).json({err: e})
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

        res.status(200).json({rows, codigo: 200})
    } catch (e){
        console.log(e)
        res.status(500).json({err: e})
    }
}

const dropActivo = async(req, res) => {
    const id = req.params.id
    try {
        const r =await pool.query('DELETE FROM activo WHERE id_activo = $1 RETURNING *', [id])


        if(r.rowCount===0){
            return res.status(404).json({msg: "Activo no encontrado"})
        }


        res.status(200).json({msg: "Activo eliminado exitosamente", activo: r.rows[0]})


    } catch (e){
        console.log(e)
        res.status(500).json({err: e})
    }
}


const editarActivo = async(req, res) => {
    const {nombre, descripcion, modelo, numero_serie, fecha_compra, precio_compra, id_categoria, id_estado_activo, id_aula} = req.body
    const id_activo = req.params.id

    try {
        const { rows } = await pool.query('SELECT * FROM activo WHERE id_activo = $1', [id_activo])
        const activo = rows[0]

        if (rows.length === 0){
            return res.status(404).json({msg: "Activo no encontrado"})
        }

        const r = await pool.query(`
            UPDATE activo SET
            nombre = $2,
            descripcion = $3,
            modelo = $4,
            numero_serie = $5,
            fecha_compra = $6,
            precio_compra = $7,
            id_categoria = $8,
            id_estado_activo = $9,
            id_aula = $10
            WHERE id_activo = $1 RETURNING *
        `,
        [
            id_activo,
            nombre || activo.nombre,
            descripcion || activo.descripcion,
            modelo || activo.modelo,
            numero_serie || activo.numero_serie,
            fecha_compra || activo.fecha_compra,
            precio_compra || activo.precio_compra,
            id_categoria || activo.id_categoria,
            id_estado_activo || activo.id_estado_activo,
            id_aula || activo.id_aula
        ])



        res.status(200).json({msg: "Activo actualizado exitosamente", activo: r.rows[0]})


    } catch (e){
        console.log(e)
        res.status(500).json({err: e})
    }
}

const getActivosFront= async(req, res)=>{
    try{
        const response= await pool.query('select a.id_activo, a.nombre, c.nombre as categoria, aula.id_aula as aula, aula.tipo as tipo_aula, e.nombre as estado, e.color from activo a JOIN categoria c ON a.id_categoria = c.id_categoria JOIN estado_activo e ON a.id_estado_activo = e.id_estado_activo JOIN aula aula ON a.id_aula = aula.id_aula');
        if(response.rows===0){
            res.status(404).json({mensaje: 'No hay activos registrados'});
        }
        res.status(200).json(response.rows);
    }catch(e){
        console.log(e);
        res.status(500).json({mensaje: `Error en el servidor ${e}`});
    }
}

module.exports = { crearActivo, verActivos, buscarActivoId, buscarActivoNombre, dropActivo, editarActivo, getActivosFront }