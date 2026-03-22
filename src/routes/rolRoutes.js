const express= require('express');
const router= express.Router();
const rolController= require('../controllers/rolController');

router.get('/', rolController.obtenerRoles);
router.post('/', rolController.registrarRol);
router.put('/:nombre', rolController.editarRol);
router.delete('/:nombre', rolController.eliminaRol);

module.exports = router;