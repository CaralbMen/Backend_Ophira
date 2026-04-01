const express = require('express');
const router = express.Router();
const ubicacionController= require('../controllers/UbicacionController');

// Edificio
router.get('/edificio', ubicacionController.getEdificios);
router.post('/edificio', ubicacionController.crearEdificio);
router.put('/edificio/:id_edificio', ubicacionController.editarEdificio);
router.delete('/edificio/:id_edificio', ubicacionController.eliminarEdificio);

// Pisos
router.get('/piso', ubicacionController.getPisos);
router.get('/piso/:id_edificio', ubicacionController.getPisosEdificio);
router.post('/piso', ubicacionController.crearPiso);
router.put('/piso/:id_piso', ubicacionController.editarPiso);
router.delete('/piso/:id_piso', ubicacionController.eliminarPiso);

// Aulas
router.get('/aulas', ubicacionController.getAulas);
router.get('/aula/:id_piso', ubicacionController.getAulasPiso);
router.post('/aula', ubicacionController.crearAula);
router.put('/aula/:id_aula', ubicacionController.editarAula);
router.delete('/aula/:id_aula', ubicacionController.eliminarAula);

module.exports = router;