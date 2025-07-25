const authService = require('../services/authService');

// Middleware para verificar autenticación
const verificarAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token de acceso requerido',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '
    const verificacion = await authService.verificarSesion(token);

    if (!verificacion.valid) {
      return res.status(401).json({ 
        error: 'Token inválido o expirado',
        code: 'INVALID_TOKEN'
      });
    }

    // Agregar información del usuario a la request
    req.usuario = verificacion.usuario;
    next();

  } catch (error) {
    return res.status(401).json({ 
      error: 'Error de autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware para verificar roles específicos
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Middleware para verificar que el usuario sea administrador
const verificarAdmin = verificarRol(['Administrador']);

// Middleware para verificar que el usuario sea administrador o editor
const verificarAdminOEditor = verificarRol(['Administrador', 'Editor']);

module.exports = {
  verificarAuth,
  verificarRol,
  verificarAdmin,
  verificarAdminOEditor
};