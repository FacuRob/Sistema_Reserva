const express = require('express');
const router = express.Router();
const {
  obtenerEscritorios,
  obtenerEscritorioPorId,
  crearEscritorio,
  actualizarEscritorio,
  eliminarEscritorio,
  obtenerDisponibilidad,
} = require('../controllers/escritorioController');
const { verificarToken } = require('../middleware/auth');

router.get('/', obtenerEscritorios);
router.get('/:id', obtenerEscritorioPorId);
router.get('/:id/disponibilidad', obtenerDisponibilidad);
router.post('/', verificarToken, crearEscritorio);
router.put('/:id', verificarToken, actualizarEscritorio);
router.delete('/:id', verificarToken, eliminarEscritorio);

module.exports = router;