const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar controladores
const usuarioController = require('./src/controllers/usuarioController');
const rolController = require('./src/controllers/rolController');
const authController = require('./src/controllers/authController');

// Importar middleware
const { verificarAuth, verificarAdmin, verificarAdminOEditor } = require('./src/middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Middleware para obtener IP real
app.set('trust proxy', true);

// Rutas públicas de autenticación
app.post('/api/auth/solicitar-token', authController.tokenRequestLimit, authController.solicitarToken);
app.post('/api/auth/verificar-token', authController.tokenVerifyLimit, authController.verificarToken);

// Rutas protegidas de autenticación
app.get('/api/auth/estado', verificarAuth, authController.verificarEstado);
app.post('/api/auth/cerrar-sesion', verificarAuth, authController.cerrarSesion);
app.post('/api/auth/limpiar-expirados', verificarAuth, verificarAdmin, authController.limpiarExpirados);

// Rutas protegidas de usuarios (requieren autenticación)
app.get('/api/usuarios', verificarAuth, usuarioController.obtenerTodos);
app.get('/api/usuarios/:id', verificarAuth, usuarioController.obtenerPorId);
app.post('/api/usuarios', verificarAuth, verificarAdminOEditor, usuarioController.crear);
app.put('/api/usuarios/:id', verificarAuth, verificarAdminOEditor, usuarioController.actualizar);
app.delete('/api/usuarios/:id', verificarAuth, verificarAdmin, usuarioController.eliminar);
app.delete('/api/usuarios', verificarAuth, verificarAdmin, usuarioController.eliminarMultiples);

// Rutas protegidas de roles (requieren autenticación)
app.get('/api/roles', verificarAuth, rolController.obtenerTodos);
app.get('/api/roles/:id', verificarAuth, rolController.obtenerPorId);
app.post('/api/roles', verificarAuth, verificarAdmin, rolController.crear);
app.put('/api/roles/:id', verificarAuth, verificarAdmin, rolController.actualizar);
app.delete('/api/roles/:id', verificarAuth, verificarAdmin, rolController.eliminar);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ message: 'API funcionando correctamente', timestamp: new Date().toISOString() });
});

// Ruta para servir la página principal (dashboard)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Ruta para servir la página de login
app.get('/login.html', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// Ruta catch-all para servir archivos estáticos y SPA
app.get('*', (req, res) => {
  // Si es una ruta de API que no existe, devolver 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Para cualquier otra ruta, servir la página principal
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);

});