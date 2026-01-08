const express = require('express');
const router = express.Router();
const {
  crearReserva,
  obtenerReservas,
  obtenerMisReservas,
  obtenerReservaPorId,
  actualizarReserva,
  cancelarReserva,
  eliminarReserva,
} = require('../controllers/reservaController');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas de reservas requieren autenticación
router.use(verificarToken);

// Rutas de reservas
router.post('/', crearReserva);
router.get('/', obtenerReservas);
router.get('/mis-reservas', obtenerMisReservas);
router.get('/:id', obtenerReservaPorId);
router.put('/:id', actualizarReserva);
router.patch('/:id/cancelar', cancelarReserva);
router.delete('/:id', eliminarReserva);

module.exports = router;