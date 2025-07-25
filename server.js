const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar controladores
const usuarioController = require('./src/controllers/usuarioController');
const rolController = require('./src/controllers/rolController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas de usuarios
app.get('/api/usuarios', usuarioController.obtenerTodos);
app.get('/api/usuarios/:id', usuarioController.obtenerPorId);
app.post('/api/usuarios', usuarioController.crear);
app.put('/api/usuarios/:id', usuarioController.actualizar);
app.delete('/api/usuarios/:id', usuarioController.eliminar);
app.delete('/api/usuarios', usuarioController.eliminarMultiples);
app.post('/api/auth/login', usuarioController.login);

// Rutas de roles
app.get('/api/roles', rolController.obtenerTodos);
app.get('/api/roles/:id', rolController.obtenerPorId);
app.post('/api/roles', rolController.crear);
app.put('/api/roles/:id', rolController.actualizar);
app.delete('/api/roles/:id', rolController.eliminar);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ message: 'API funcionando correctamente', timestamp: new Date().toISOString() });
});

// Ruta para servir la página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
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