const express = require('express')
const router = express.Router()
const auditoriaController = require('../controllers/auditoriaController')

// CREAR AUDITORIA
router.post('/', auditoriaController.crearAuditoria)

// VER AUDITORIAS (todas, buscar por id)
router.get('/', auditoriaController.verAuditorias)
router.get('/:id', auditoriaController.buscarAuditoriaId)

// EDITAR Y ELIMINAR
router.delete('/:id', auditoriaController.dropAuditoria)
router.put('/:id', auditoriaController.editarAuditoria)

module.exports = router