const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const escritorioRoutes = require('./routes/escritorioRoutes');
const reservaRoutes = require('./routes/reservaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Reserva Escritorio API'
  });
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/escritorios', escritorioRoutes);
app.use('/api/reservas', reservaRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar el servidor
const iniciarServidor = async () => {
  try {
    // Verificar conexión a la base de datos
    const conexionExitosa = await testConnection();
    
    if (!conexionExitosa) {
      console.error('❌ No se pudo conectar a la base de datos. Abortando inicio del servidor.');
      process.exit(1);
    }

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📡 API disponible en http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejar señales de cierre
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando servidor chausi...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Cerrando servidor chausi...');
  process.exit(0);
});

iniciarServidor();