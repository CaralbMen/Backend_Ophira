const express = require('express');
const router = express.Router();
const ubicacionController= require('../controllers/UbicacionController');

// Edificio
router.get('/edificio', ubicacionController.getEdificios);
router.post('/edificio', ubicacionController.crearEdificio);

// Pisos
router.get('/piso', ubicacionController.getPisos);
router.get('/piso/:id_edificio', ubicacionController.getPisosEdificio);
router.post('/piso', ubicacionController.crearPiso);

// Aulas
router.get('/aula', ubicacionController.getAulas);
router.get('/aula/:id_piso', ubicacionController.getAulasPiso);
router.post('/aula', ubicacionController.crearAula);

module.exports = router;