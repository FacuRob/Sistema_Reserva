const jwt = require('jsonwebtoken');

// Middleware para verificar el token JWT
const verificarToken = (req, res, next) => {
  try {
    // Obtener el token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No se proporcionó un token de autenticación' 
      });
    }

    // Extraer el token
    const token = authHeader.substring(7);

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar la información del usuario al request
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado' 
      });
    }

    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({ 
      error: 'Error al verificar autenticación' 
    });
  }
};

module.exports = { verificarToken };