const pool= require('../config/db');

//Edificio
const getEdificios= async(req, res)=>{
    try{
        const response= await pool.query('SELECT * FROM edificio');
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener los edificios:', error);
        res.status(500).json({message: 'Error al obtener los edificios'});
    }
}
const crearEdificio= async(req, res)=>{
    const {clave, nombre, cantidad_pisos, direccion}= req. body;
    if(!clave) return res.status(400).json({message: 'La clave es requerida'});
    if(!nombre) return res.status(400).json({message: 'El nombre es requerido'});
    if(!cantidad_pisos) return res.status(400).json({message: 'La cantidad de pisos es requerida'});
    if(!direccion) return res.status(400).json({message: 'La direccion es requerida'});
    console
    try{
        await pool.query('INSERT INTO edificio (id_edificio, nombre, cantidad_pisos, direccion) VALUES ($1, $2, $3, $4)', 
            [clave, nombre, cantidad_pisos, direccion]);
        res.status(201).json({message: 'Edificio creado correctamente'});
    } catch (error) {
        console.error('Error al crear el edificio:', error);
        res.status(500).json({message: 'Error al crear el edificio'});
    }
}

// Pisos
const getPisos= async(req, res)=>{
    try{
        const response= await pool.query('SELECT * FROM piso');
        res.status(200).json(response.rows);
    }catch (error) {
        console.error('Error al obtener los pisos:', error);
        res.status(500).json({message: 'Error al obtener los pisos'});
    }
}
const getPisosEdificio= async(req, res)=>{
    const {id_edificio}= req.params;
    try{
        const response= await pool.query('SELECT * FROM piso WHERE id_edificio= $1', [id_edificio.toUpperCase()]);
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener los pisos del edificio:', error);
        res.status(500).json({message: 'Error al obtener los pisos del edificio'});
    }
}
const crearPiso= async(req, res)=>{
    const {id_edificio, numero_piso, cantidad_aulas}= req.body;
    if(!id_edificio) return res.status(400).json({message: 'El edificio en que se encuentraes requerido'});
    if(!numero_piso) return res.status(400).json({message: 'El numero del piso es requerido'});
    if(!cantidad_aulas) return res.status(400).json({message: 'La cantidad de aulas es requerida'});
    const id= `${id_edificio}${numero_piso}`;
    try{
        await pool.query('INSERT INTO piso (id_piso, id_edificio, numero_piso, cantidad_aulas) VALUES ($1, $2, $3, $4)', 
            [id, id_edificio, numero_piso, cantidad_aulas]);
        res.status(201).json({message: 'Piso creado correctamente'});
    } catch (error) {
        console.error('Error al crear el piso:', error);
        res.status(500).json({message: 'Error al crear el piso'});
    }
}

// Aulas
const getAulas= async(req, res)=>{
    try{
        const response= await pool.query('SELECT * FROM aula');
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener las aulas:', error);
        res.status(500).json({message: 'Error al obtener las aulas'});
    }
}
const getAulasPiso= async(req, res)=>{
    const {id_piso}= req.params;
    try{
        const response= await pool.query('SELECT * FROM aula WHERE id_piso= $1', [id_piso.toUpperCase()]);
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener las aulas del piso:', error);
        res.status(500).json({message: 'Error al obtener las aulas del piso'});
    }
}
const crearAula= async(req, res)=>{
    const {id_piso, numero_aula, tipo}= req.body;
    if(!id_piso) return res.status(400).json({message: 'El id del piso es requerido'});
    if(!numero_aula) return res.status(400).json({message: 'El numero de la aula es requerido'});
    if(!tipo) return res.status(400).json({message: 'El tipo de aula es requerido'});
    const id= `${id_piso}${numero_aula}`;
    try{
        await pool.query('INSERT INTO aula (id_aula, id_piso, numero_aula, tipo) VALUES ($1, $2, $3, $4)', 
            [id, id_piso,numero_aula, tipo]);
        res.status(201).json({message: 'Aula creada correctamente'});
    } catch (error) {
        console.error('Error al crear la aula:', error);
        res.status(500).json({message: 'Error al crear la aula'});
    }
}

const editarAula = async (req, res) => {
    const { id_aula } = req.params;
    const { id_piso, numero_aula, tipo } = req.body;

    try {
        const existente = await pool.query('SELECT * FROM aula WHERE id_aula = $1', [id_aula.toUpperCase()]);
        if (existente.rowCount === 0) {
            return res.status(404).json({ message: `No se encontro la aula ${id_aula}` });
        }

        const actual = existente.rows[0];

        const result = await pool.query(
            `UPDATE aula
             SET id_piso = $2,
                 numero_aula = $3,
                 tipo = $4
             WHERE id_aula = $1
             RETURNING *`,
            [
                id_aula.toUpperCase(),
                id_piso || actual.id_piso,
                numero_aula || actual.numero_aula,
                tipo || actual.tipo
            ]
        );

        res.status(200).json({ message: 'Aula actualizada correctamente', aula: result.rows[0] });
    } catch (error) {
        console.error('Error al editar la aula:', error);
        res.status(500).json({ message: 'Error al editar la aula' });
    }
};

const eliminarAula = async (req, res) => {
    const { id_aula } = req.params;

    try {
        const result = await pool.query('DELETE FROM aula WHERE id_aula = $1 RETURNING *', [id_aula.toUpperCase()]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: `No se encontro la aula ${id_aula}` });
        }

        res.status(200).json({ message: 'Aula eliminada correctamente', aula: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar la aula:', error);
        res.status(500).json({ message: 'Error al eliminar la aula' });
    }
};


module.exports= {
    getEdificios,
    crearEdificio,
    getPisos,
    getPisosEdificio,
    crearPiso,
    getAulas,
    getAulasPiso,
    crearAula,
    editarAula,
    eliminarAula
}
