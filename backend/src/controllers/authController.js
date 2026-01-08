const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Registrar nuevo usuario
const registrarUsuario = async (req, res) => {
  const { nombre, apellido, email, telefono, password } = req.body;

  try {
    // Validar campos requeridos
    if (!nombre || !apellido || !email || !telefono || !password) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Formato de email inválido' 
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(409).json({ 
        error: 'El email ya está registrado' 
      });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insertar usuario en la base de datos
    // Termino VALUES ($1, $2, $3, $4, $5) para evitar SQL Injection y proteger los datos
    const resultado = await query(
      `INSERT INTO usuarios (nombre, apellido, email, telefono, password) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, nombre, apellido, email, telefono, created_at`,
      [nombre, apellido, email, telefono, passwordHash]
    );

    const nuevoUsuario = resultado.rows[0];

    // Generar token JWT
    const token = jwt.sign(
      { id: nuevoUsuario.id, email: nuevoUsuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
        telefono: nuevoUsuario.telefono,
      },
      token,
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario' 
    });
  }
};

// Login de usuario
const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario por email
    const resultado = await query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    const usuario = resultado.rows[0];

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
      },
      token,
    });
  } catch (error) {
    console.error('Error al hacer login:', error);
    res.status(500).json({ 
      error: 'Error al hacer login' 
    });
  }
};

// Obtener perfil del usuario autenticado
const obtenerPerfil = async (req, res) => {
  try {
    const resultado = await query(
      'SELECT id, nombre, apellido, email, telefono, created_at FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    res.json({ usuario: resultado.rows[0] });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ 
      error: 'Error al obtener perfil' 
    });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
};