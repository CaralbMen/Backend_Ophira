const express= require('express');
const router= express.Router();
const rolController= require('../controllers/rolController');

router.get('/obtener', rolController.obtenerRoles);
router.post('/registrar', rolController.registrarRol);
router.put('editar/:nombre', rolController.editarRol);
router.delete('/eliminar', rolController.eliminaRol);

module.exports = router;