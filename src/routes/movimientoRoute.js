const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');
//const { editarEstadoActivo } = require('../controllers/estadoActivoController');

// el de estado de activo no lo puse yo xd dany, pero de todas formas lo dejo por cualquiuer cosa
router.get('/',movimientoController.verMovimiento)

router.get('/:id',movimientoController.buscarMovimientoID)

router.post('/',movimientoController.crearMovimiento)

router.delete('/:id',movimientoController.dropMovimiento)

router.put('/:id', movimientoController.editarMovimiento)

//router.put('/:id',movimientoController,editarEstadoActivo)

module.exports = router;