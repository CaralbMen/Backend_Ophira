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
        if(!datos.id_responsable) { return res.status(400).json({msg: "El responsable no puede estar vacío"}) }
        
        const {rows} = await pool.query(`INSERT INTO activo 
            (nombre, descripcion, modelo, numero_serie, fecha_compra, precio_compra, valor_actual, valor_residual, vida_util_anios, id_metodo_depreciacion, id_categoria, id_estado_activo, id_aula, id_responsable)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
            `, 
        [datos.nombre, datos.descripcion, datos.modelo, datos.numero_serie, datos.fecha_compra, 
        datos.precio_compra, datos.valor_actual, datos.valor_residual, datos.vida_util_anios, datos.id_metodo_depreciacion, datos.id_categoria, datos.id_estado_activo, datos.id_aula, datos.id_responsable])
        
        if(datos.partes){
            try{
                console.log("Insertando partes...")
                await pool.query('BEGIN');
                
                let parteCount = 2;
                for (const parte of datos.partes){
                    await pool.query(`INSERT INTO partes_de_activo (id_activo, numero_parte, id_aula, descripcion) VALUES ($1, $2, $3, $4)`, [rows[0].id_activo, parteCount, parte.id_aula, parte.descripcion || `Parte ${parteCount}`])
                    parteCount++;
                }
                
                await pool.query('COMMIT');
            } catch(e){
                await pool.query('ROLLBACK');
                throw e;
            }
        }
        res.status(200).json({msg: "Datos insertados exitosamente", datos: rows, codigo: 200})


    } catch (e){
        console.log(e)
        res.status(500).json({err: e})
    }
}

const verActivos = async(req, res) => { // ver TODOS los activos
    try{
        const { rows } = await pool.query(`SELECT
            a.*, 
            c.nombre AS categoria_nombre,
            e.nombre AS estado_nombre,
            au.numero_aula,
            au.tipo AS tipo_aula
            FROM activo a
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

const verActivosDelUser = async(req, res) => { // ver TODOS los activos con id de usuario para mobile
    const id = req.usuario.id
    try{
        const { rows } = await pool.query(`SELECT
            a.*, 
            c.nombre AS categoria_nombre,
            e.nombre AS estado_nombre,
            au.numero_aula,
            au.tipo AS tipo_aula
            FROM activo a
            JOIN categoria c ON a.id_categoria = c.id_categoria
            JOIN estado_activo e ON a.id_estado_activo = e.id_estado_activo
            JOIN aula au ON a.id_aula = au.id_aula
            WHERE a.id_responsable = $1
            `, [id])

        res.status(200).json({ rows })
    } catch (e){
        console.log(e)
        res.status(500).json({err: e})
    }
}

const buscarActivoId = async(req, res) => { // buscar activo por ID
    const id = req.params.id;
    try{
        const { rows } = await pool.query(`
            SELECT 
                a.id_activo,
                a.nombre,
                a.descripcion,
                a.modelo,
                a.numero_serie,
                a.fecha_compra,
                a.precio_compra,
                a.valor_actual,
                a.valor_residual,
                a.vida_util_anios,
                a.id_metodo_depreciacion,
                a.id_categoria,
                c.nombre AS categoria,
                a.id_estado_activo,
                e.nombre AS estado,
                e.color,
                a.id_aula,
                au.tipo AS tipo_aula,
                a.id_responsable,
                u.nombre_usuario AS responsable,
                NULL::TIMESTAMP AS fecha_registro,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id_parte', p.id_parte,
                            'numero_parte', p.numero_parte,
                            'id_aula', p.id_aula,
                            'descripcion', p.descripcion
                        )
                        ORDER BY p.numero_parte
                    ) FILTER (WHERE p.id_parte IS NOT NULL),
                    '[]'::json
                ) AS partes
            FROM activo a
            JOIN categoria c ON a.id_categoria = c.id_categoria
            JOIN estado_activo e ON a.id_estado_activo = e.id_estado_activo
            JOIN aula au ON a.id_aula = au.id_aula
            LEFT JOIN usuario u ON a.id_responsable = u.id_usuario
            LEFT JOIN partes_de_activo p ON a.id_activo = p.id_activo
            WHERE a.id_activo = $1
            GROUP BY
                a.id_activo,
                a.nombre,
                a.descripcion,
                a.modelo,
                a.numero_serie,
                a.fecha_compra,
                a.precio_compra,
                a.valor_actual,
                a.valor_residual,
                a.vida_util_anios,
                a.id_metodo_depreciacion,
                a.id_categoria,
                c.nombre,
                a.id_estado_activo,
                e.nombre,
                e.color,
                a.id_aula,
                au.tipo,
                a.id_responsable,
                u.nombre_usuario
            `, [id])

        if (rows.length == 0){
            return res.status(404).json({msg: "Activo no encontrado"})
        }

        res.status(200).json({rows: rows[0], codigo: 200})
    } catch (e){
        console.log(e)
        res.status(500).json({err: e})
    }
}

const buscarActivoNombre = async(req, res) => { // buscar activo por NOMBRE
    const nombre = req.params.nombre;
    try{
        const { rows } = await pool.query(`SELECT
            a.*,
            c.nombre AS categoria_nombre,
            au.numero_aula,
            au.tipo AS tipo_aula,
            e.nombre AS estado_nombre
            FROM activo a
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
    const datos = req.body
    const id_activo = req.params.id

    try {
        await pool.query('BEGIN')

        const { rows } = await pool.query('SELECT * FROM activo WHERE id_activo = $1', [id_activo])
        if (rows.length === 0){
            await pool.query('ROLLBACK')
            return res.status(404).json({msg: "Activo no encontrado"})
        }

        const activo = rows[0]
        const r = await pool.query(`
            UPDATE activo SET
            nombre = $2,
            descripcion = $3,
            modelo = $4,
            numero_serie = $5,
            fecha_compra = $6,
            precio_compra = $7,
            valor_actual = $8,
            valor_residual = $9,
            vida_util_anios = $10,
            id_metodo_depreciacion = $11,
            id_categoria = $12,
            id_estado_activo = $13,
            id_aula = $14,
            id_responsable = $15
            WHERE id_activo = $1
            RETURNING *
        `,
        [
            id_activo,
            datos.nombre ?? activo.nombre,
            datos.descripcion ?? activo.descripcion,
            datos.modelo ?? activo.modelo,
            datos.numero_serie ?? activo.numero_serie,
            datos.fecha_compra ?? activo.fecha_compra,
            datos.precio_compra ?? activo.precio_compra,
            datos.valor_actual ?? activo.valor_actual,
            datos.valor_residual ?? activo.valor_residual,
            datos.vida_util_anios ?? activo.vida_util_anios,
            datos.id_metodo_depreciacion ?? activo.id_metodo_depreciacion,
            datos.id_categoria ?? activo.id_categoria,
            datos.id_estado_activo ?? activo.id_estado_activo,
            datos.id_aula ?? activo.id_aula,
            datos.id_responsable ?? activo.id_responsable
        ])

        if (Array.isArray(datos.partes)) {
            await pool.query('DELETE FROM partes_de_activo WHERE id_activo = $1', [id_activo])

            let parteCount = 2
            for (const parte of datos.partes) {
                await pool.query(
                    'INSERT INTO partes_de_activo (id_activo, numero_parte, id_aula, descripcion) VALUES ($1, $2, $3, $4)',
                    [id_activo, parteCount, parte.id_aula, parte.descripcion || `Parte ${parteCount}`]
                )
                parteCount++
            }
        }

        await pool.query('COMMIT')
        res.status(200).json({msg: "Activo actualizado exitosamente", activo: r.rows[0]})
    } catch (e){
        try {
            await pool.query('ROLLBACK')
        } catch (rollbackError) {
            console.log(rollbackError)
        }
        console.log(e)
        res.status(500).json({err: e})
    }
}
const getActivoFront = async(req, res) => {
    const id = req.params.id;
    try {
        console.log(`Obteniendo detalles del activo con ID: ${id}`)
        const { rows } = await pool.query(`select a.id_activo, a.nombre, c.nombre as categoria, enc.nombre_usuario as encargado, enc.id_usuario, e.nombre as estado, e.color from activo a join categoria c on a.id_categoria = c.id_categoria left join usuario enc on a.id_responsable = enc.id_usuario join estado_activo e on a.id_estado_activo = e.id_estado_activo where a.id_activo = $1`, [id])
        res.status(200).json(rows)

    } catch (e) {
        console.log(e)
        res.status(500).json({err: e})
    }
}

const getActivosFront= async(req, res)=>{
    try{
        const response= await pool.query(`
            SELECT 
                a.id_activo,
                a.nombre,
                u.nombre_usuario AS responsable,
                c.nombre AS categoria,
                aula.id_aula AS aula,
                aula.tipo AS tipo_aula,
                e.nombre AS estado,
                e.color,
                NULL::TIMESTAMP AS fecha_registro,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id_parte', p.id_parte,
                            'numero_parte', p.numero_parte,
                            'id_aula', p.id_aula,
                            'descripcion', p.descripcion
                        )
                        ORDER BY p.numero_parte
                    ) FILTER (WHERE p.id_parte IS NOT NULL),
                    '[]'::json
                ) AS partes
            FROM activo a
            JOIN categoria c ON a.id_categoria = c.id_categoria
            JOIN estado_activo e ON a.id_estado_activo = e.id_estado_activo
            JOIN aula aula ON a.id_aula = aula.id_aula
            LEFT JOIN usuario u ON a.id_responsable = u.id_usuario
            LEFT JOIN partes_de_activo p ON a.id_activo = p.id_activo
            GROUP BY
                a.id_activo,
                a.nombre,
                u.nombre_usuario,
                c.nombre,
                aula.id_aula,
                aula.tipo,
                e.nombre,
                e.color
            ORDER BY a.id_activo DESC
        `);
        if(response.rows.length === 0){
            return res.status(404).json({mensaje: 'No hay activos registrados'});
        }
        res.status(200).json(response.rows);
    }catch(e){
        console.log(e);
        res.status(500).json({mensaje: `Error en el servidor ${e}`});
    }
}

const getDatosDashboard = async(req, res) => {
    try {
        const response = await pool.query(`select * from dashboard`);
        res.status(200).json(response.rows);
    } catch (e) {
        console.log(e);
        res.status(500).json({mensaje: `Error en el servidor ${e}`});
    }
}
const getDatosReporte= async(req, res) => {
        try {
            const response = await pool.query(`select * from reporte`);
            res.status(200).json(response.rows);
        } catch (e) {
            console.log(e);
            res.status(500).json({mensaje: `Error en el servidor ${e}`});
        }
}

module.exports = { verActivosDelUser ,crearActivo, verActivos, buscarActivoId, buscarActivoNombre, dropActivo, editarActivo, getActivosFront, getActivoFront, getDatosDashboard, getDatosReporte }