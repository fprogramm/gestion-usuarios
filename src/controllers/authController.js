const authService = require('../services/authService');
const rateLimit = require('express-rate-limit');

// Rate limiting para solicitudes de token
const tokenRequestLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // máximo 3 intentos por IP cada 15 minutos
  message: {
    error: 'Demasiados intentos de solicitud de token. Intenta de nuevo en 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para verificación de token
const tokenVerifyLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP cada 15 minutos
  message: {
    error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authController = {
  // Aplicar rate limiting
  tokenRequestLimit,
  tokenVerifyLimit,

  // Solicitar token de login
  async solicitarToken(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          error: 'Email es requerido',
          code: 'MISSING_EMAIL'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Formato de email inválido',
          code: 'INVALID_EMAIL_FORMAT'
        });
      }

      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      const resultado = await authService.solicitarTokenLogin(email, ipAddress, userAgent);
      
      res.json({
        success: true,
        message: resultado.message,
        expiresIn: resultado.expiresIn
      });

    } catch (error) {
      console.error('Error solicitando token:', error);
      res.status(400).json({ 
        error: error.message,
        code: 'TOKEN_REQUEST_ERROR'
      });
    }
  },

  // Verificar token y hacer login
  async verificarToken(req, res) {
    try {
      const { email, token } = req.body;
      
      if (!email || !token) {
        return res.status(400).json({ 
          error: 'Email y token son requeridos',
          code: 'MISSING_CREDENTIALS'
        });
      }

      // Validar que el token sea de 6 dígitos
      if (!/^\d{6}$/.test(token)) {
        return res.status(400).json({ 
          error: 'Token debe ser de 6 dígitos',
          code: 'INVALID_TOKEN_FORMAT'
        });
      }

      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      const resultado = await authService.verificarTokenLogin(email, token, ipAddress, userAgent);
      
      res.json({
        success: true,
        message: resultado.message,
        token: resultado.token,
        usuario: resultado.usuario
      });

    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(401).json({ 
        error: error.message,
        code: 'TOKEN_VERIFICATION_ERROR'
      });
    }
  },

  // Verificar estado de autenticación
  async verificarEstado(req, res) {
    try {
      // El middleware ya verificó el token, solo devolvemos la info del usuario
      res.json({
        success: true,
        authenticated: true,
        usuario: req.usuario
      });
    } catch (error) {
      res.status(401).json({ 
        error: 'No autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }
  },

  // Cerrar sesión
  async cerrarSesion(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader.substring(7); // Remover 'Bearer '
      
      await authService.cerrarSesion(token);
      
      res.json({
        success: true,
        message: 'Sesión cerrada correctamente'
      });

    } catch (error) {
      console.error('Error cerrando sesión:', error);
      res.status(500).json({ 
        error: 'Error al cerrar sesión',
        code: 'LOGOUT_ERROR'
      });
    }
  },

  // Endpoint para limpiar tokens expirados (solo admin)
  async limpiarExpirados(req, res) {
    try {
      const resultado = await authService.limpiarExpirados();
      res.json(resultado);
    } catch (error) {
      console.error('Error limpiando expirados:', error);
      res.status(500).json({ 
        error: 'Error en limpieza',
        code: 'CLEANUP_ERROR'
      });
    }
  }
};

module.exports = authController;