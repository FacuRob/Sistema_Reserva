const { query } = require('../config/database');

// Helper para validar solapamiento de horarios
const validarSolapamiento = async (escritorioId, fecha, horaInicio, horaFin, reservaId = null) => {
  let queryText = `
    SELECT id FROM reserva 
    WHERE escritorio_id = $1 
      AND reserva_date = $2 
      AND estado = 'confirmed'
      AND (
        (start_time < $4 AND end_time > $3) OR
        (start_time >= $3 AND start_time < $4) OR
        (end_time > $3 AND end_time <= $4)
      )
  `;
  
  const params = [escritorioId, fecha, horaInicio, horaFin];

  // Si estamos actualizando, excluir la reserva actual
  if (reservaId) {
    queryText += ' AND id != $5';
    params.push(reservaId);
  }

  const resultado = await query(queryText, params);
  return resultado.rows.length > 0;
};

// Crear nueva reserva
const crearReserva = async (req, res) => {
  const { escritorio_id, reserva_date, start_time, end_time } = req.body;
  const usuario_id = req.usuario.id;

  try {
    // Validar campos requeridos
    if (!escritorio_id || !reserva_date || !start_time || !end_time) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Validar que la hora de fin sea posterior a la de inicio
    if (start_time >= end_time) {
      return res.status(400).json({ 
        error: 'La hora de fin debe ser posterior a la hora de inicio' 
      });
    }

    // Validar que la fecha no sea en el pasado
    const fechaReserva = new Date(reserva_date);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaReserva < hoy) {
      return res.status(400).json({ 
        error: 'No se pueden hacer reservas en fechas pasadas' 
      });
    }

    // Verificar que el escritorio existe y está disponible
    const escritorio = await query(
      'SELECT id, disponible FROM escritorio WHERE id = $1',
      [escritorio_id]
    );

    if (escritorio.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Escritorio no encontrado' 
      });
    }

    if (!escritorio.rows[0].disponible) {
      return res.status(400).json({ 
        error: 'El escritorio no está disponible' 
      });
    }

    // Validar solapamiento
    const haySolapamiento = await validarSolapamiento(
      escritorio_id, 
      reserva_date, 
      start_time, 
      end_time
    );

    if (haySolapamiento) {
      return res.status(409).json({ 
        error: 'El escritorio ya está reservado en ese horario' 
      });
    }

    // Crear la reserva
    // Termino VALUES ($1, $2, $3, $4, $5) para evitar SQL Injection y proteger los datos
    const resultado = await query(
      `INSERT INTO reserva (usuario_id, escritorio_id, reserva_date, start_time, end_time) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [usuario_id, escritorio_id, reserva_date, start_time, end_time]
    );

    res.status(201).json({
      mensaje: 'Reserva creada exitosamente',
      reserva: resultado.rows[0],
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ 
      error: 'Error al crear reserva' 
    });
  }
};

// Obtener todas las reservas (con filtros opcionales)
const obtenerReservas = async (req, res) => {
  const { escritorio_id, fecha, estado } = req.query;

  try {
    let queryText = `
      SELECT r.*, 
             u.nombre, u.apellido, u.email, u.telefono,
             e.nombre as escritorio_nombre, e.localidad
      FROM reserva r
      JOIN usuarios u ON r.usuario_id = u.id
      JOIN escritorio e ON r.escritorio_id = e.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (escritorio_id) {
      queryText += ` AND r.escritorio_id = $${paramCount}`;
      params.push(escritorio_id);
      paramCount++;
    }

    if (fecha) {
      queryText += ` AND r.reserva_date = $${paramCount}`;
      params.push(fecha);
      paramCount++;
    }

    if (estado) {
      queryText += ` AND r.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    queryText += ' ORDER BY r.reserva_date DESC, r.start_time ASC';

    const resultado = await query(queryText, params);

    res.json({
      reservas: resultado.rows,
      total: resultado.rows.length,
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ 
      error: 'Error al obtener reservas' 
    });
  }
};

// Obtener reservas del usuario autenticado
const obtenerMisReservas = async (req, res) => {
  const usuario_id = req.usuario.id;

  try {
    const resultado = await query(
      `SELECT r.*, 
              e.nombre as escritorio_nombre, e.descripcion, e.localidad
       FROM reserva r
       JOIN escritorio e ON r.escritorio_id = e.id
       WHERE r.usuario_id = $1
       ORDER BY r.reserva_date DESC, r.start_time ASC`,
      [usuario_id]
    );

    res.json({
      reservas: resultado.rows,
      total: resultado.rows.length,
    });
  } catch (error) {
    console.error('Error al obtener mis reservas:', error);
    res.status(500).json({ 
      error: 'Error al obtener mis reservas' 
    });
  }
};

// Obtener una reserva por ID
const obtenerReservaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await query(
      `SELECT r.*, 
              u.nombre, u.apellido, u.email, u.telefono,
              e.nombre as escritorio_nombre, e.descripcion, e.localidad
       FROM reserva r
       JOIN usuarios u ON r.usuario_id = u.id
       JOIN escritorio e ON r.escritorio_id = e.id
       WHERE r.id = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Reserva no encontrada' 
      });
    }

    res.json({ reserva: resultado.rows[0] });
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ 
      error: 'Error al obtener reserva' 
    });
  }
};

// Actualizar reserva
const actualizarReserva = async (req, res) => {
  const { id } = req.params;
  const { escritorio_id, reserva_date, start_time, end_time } = req.body;
  const usuario_id = req.usuario.id;

  try {
    // Verificar que la reserva existe y pertenece al usuario
    const reservaExistente = await query(
      'SELECT * FROM reserva WHERE id = $1 AND usuario_id = $2',
      [id, usuario_id]
    );

    if (reservaExistente.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Reserva no encontrada o no tienes permiso para modificarla' 
      });
    }

    // Validar que la hora de fin sea posterior a la de inicio
    if (start_time && end_time && start_time >= end_time) {
      return res.status(400).json({ 
        error: 'La hora de fin debe ser posterior a la hora de inicio' 
      });
    }

    // Si se cambia el horario o escritorio, validar solapamiento
    const nuevoEscritorio = escritorio_id || reservaExistente.rows[0].escritorio_id;
    const nuevaFecha = reserva_date || reservaExistente.rows[0].reserva_date;
    const nuevaHoraInicio = start_time || reservaExistente.rows[0].start_time;
    const nuevaHoraFin = end_time || reservaExistente.rows[0].end_time;

    const haySolapamiento = await validarSolapamiento(
      nuevoEscritorio,
      nuevaFecha,
      nuevaHoraInicio,
      nuevaHoraFin,
      id
    );

    if (haySolapamiento) {
      return res.status(409).json({ 
        error: 'El escritorio ya está reservado en ese horario' 
      });
    }

    const resultado = await query(
      `UPDATE reserva 
       SET escritorio_id = COALESCE($1, escritorio_id),
           reserva_date = COALESCE($2, reserva_date),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time)
       WHERE id = $5 
       RETURNING *`,
      [escritorio_id, reserva_date, start_time, end_time, id]
    );

    res.json({
      mensaje: 'Reserva actualizada exitosamente',
      reserva: resultado.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ 
      error: 'Error al actualizar reserva' 
    });
  }
};

// Cancelar reserva (cambiar estado a 'cancelled')
const cancelarReserva = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;

  try {
    const resultado = await query(
      `UPDATE reserva 
       SET estado = 'cancelled' 
       WHERE id = $1 AND usuario_id = $2 
       RETURNING *`,
      [id, usuario_id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Reserva no encontrada o no tienes permiso para cancelarla' 
      });
    }

    res.json({
      mensaje: 'Reserva cancelada exitosamente',
      reserva: resultado.rows[0],
    });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ 
      error: 'Error al cancelar reserva' 
    });
  }
};

// Eliminar reserva permanentemente
const eliminarReserva = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;

  try {
    const resultado = await query(
      'DELETE FROM reserva WHERE id = $1 AND usuario_id = $2 RETURNING id',
      [id, usuario_id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Reserva no encontrada o no tienes permiso para eliminarla' 
      });
    }

    res.json({ 
      mensaje: 'Reserva eliminada exitosamente' 
    });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ 
      error: 'Error al eliminar reserva' 
    });
  }
};

module.exports = {
  crearReserva,
  obtenerReservas,
  obtenerMisReservas,
  obtenerReservaPorId,
  actualizarReserva,
  cancelarReserva,
  eliminarReserva,
};