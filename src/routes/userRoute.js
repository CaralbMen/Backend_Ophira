const express = require('express');
const router = express.Router();
const userController= require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/', userController.crearUsuario);
//router.post('/login', userController.login);
router.get('/', userController.obtenerUsuarios);
router.get('/me',authMiddleware, userController.obtenerUsuarioSesion)
router.get('/:id', userController.obtenerUsuario);
router.put('/:id', userController.modificarUsuario);
router.delete('/:id', userController.eliminarUsuario);

module.exports= router;