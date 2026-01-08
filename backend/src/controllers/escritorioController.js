const { query } = require('../config/database');

// Obtener todos los escritorios
const obtenerEscritorios = async (req, res) => {
  try {
    const resultado = await query(
      `SELECT id, nombre, descripcion, localidad, disponible, created_at 
       FROM escritorio 
       ORDER BY id ASC`
    );

    res.json({
      escritorios: resultado.rows,
      total: resultado.rows.length,
    });
  } catch (error) {
    console.error('Error al obtener escritorios:', error);
    res.status(500).json({ 
      error: 'Error al obtener escritorios' 
    });
  }
};

// Obtener un escritorio por ID
const obtenerEscritorioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await query(
      'SELECT * FROM escritorio WHERE id = $1',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Escritorio no encontrado' 
      });
    }

    res.json({ escritorio: resultado.rows[0] });
  } catch (error) {
    console.error('Error al obtener escritorio:', error);
    res.status(500).json({ 
      error: 'Error al obtener escritorio' 
    });
  }
};

// Crear nuevo escritorio
const crearEscritorio = async (req, res) => {
  const { nombre, descripcion, localidad } = req.body;

  try {
    // Validar campos requeridos
    if (!nombre) {
      return res.status(400).json({ 
        error: 'El nombre es requerido' 
      });
    }

    // Termino VALUES ($1, $2, $3) para evitar SQL Injection y proteger los datos
    const resultado = await query(
      `INSERT INTO escritorio (nombre, descripcion, localidad) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [nombre, descripcion || null, localidad || null]
    );

    res.status(201).json({
      mensaje: 'Escritorio creado exitosamente',
      escritorio: resultado.rows[0],
    });
  } catch (error) {
    console.error('Error al crear escritorio:', error);
    res.status(500).json({ 
      error: 'Error al crear escritorio' 
    });
  }
};

// Actualizar escritorio
const actualizarEscritorio = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, localidad, disponible } = req.body;

  try {
    // Verificar si el escritorio existe
    const escritorioExistente = await query(
      'SELECT id FROM escritorio WHERE id = $1',
      [id]
    );

    if (escritorioExistente.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Escritorio no encontrado' 
      });
    }

    const resultado = await query(
      `UPDATE escritorio 
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           localidad = COALESCE($3, localidad),
           disponible = COALESCE($4, disponible)
       WHERE id = $5 
       RETURNING *`,
      [nombre, descripcion, localidad, disponible, id]
    );

    res.json({
      mensaje: 'Escritorio actualizado exitosamente',
      escritorio: resultado.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar escritorio:', error);
    res.status(500).json({ 
      error: 'Error al actualizar escritorio' 
    });
  }
};

// Eliminar escritorio
const eliminarEscritorio = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await query(
      'DELETE FROM escritorio WHERE id = $1 RETURNING id',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Escritorio no encontrado' 
      });
    }

    res.json({ 
      mensaje: 'Escritorio eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error al eliminar escritorio:', error);
    res.status(500).json({ 
      error: 'Error al eliminar escritorio' 
    });
  }
};

// Obtener disponibilidad de un escritorio en una fecha
const obtenerDisponibilidad = async (req, res) => {
  const { id } = req.params;
  const { fecha } = req.query;

  try {
    if (!fecha) {
      return res.status(400).json({ 
        error: 'La fecha es requerida' 
      });
    }

    // Obtener todas las reservas del escritorio en esa fecha
    const resultado = await query(
      `SELECT start_time, end_time 
       FROM reserva 
       WHERE escritorio_id = $1 
         AND reserva_date = $2 
         AND estado = 'confirmed'
       ORDER BY start_time ASC`,
      [id, fecha]
    );

    res.json({
      escritorio_id: id,
      fecha: fecha,
      reservas: resultado.rows,
    });
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    res.status(500).json({ 
      error: 'Error al obtener disponibilidad' 
    });
  }
};

module.exports = {
  obtenerEscritorios,
  obtenerEscritorioPorId,
  crearEscritorio,
  actualizarEscritorio,
  eliminarEscritorio,
  obtenerDisponibilidad,
};