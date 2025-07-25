const Usuario = require('../models/Usuario');

const usuarioController = {
  // Obtener todos los usuarios
  async obtenerTodos(req, res) {
    try {
      const { search } = req.query;
      const usuarios = await Usuario.obtenerTodos(search);
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener usuario por ID
  async obtenerPorId(req, res) {
    try {
      const usuario = await Usuario.obtenerPorId(req.params.id);
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Crear nuevo usuario
  async crear(req, res) {
    try {
      const { nombre, apellido, email, password, rol_id } = req.body;
      
      // Validaciones básicas
      if (!nombre || !apellido || !email || !password || !rol_id) {
        return res.status(400).json({ 
          error: 'Todos los campos son obligatorios' 
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Formato de email inválido' 
        });
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        return res.status(400).json({ 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }

      const usuario = await Usuario.crear({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim(),
        password,
        rol_id: parseInt(rol_id)
      });
      
      res.status(201).json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar usuario
  async actualizar(req, res) {
    try {
      const { nombre, apellido, email, password, rol_id, activo } = req.body;
      
      // Validaciones básicas
      if (!nombre || !apellido || !email || !rol_id) {
        return res.status(400).json({ 
          error: 'Nombre, apellido, email y rol son obligatorios' 
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Formato de email inválido' 
        });
      }

      // Validar longitud de contraseña si se proporciona
      if (password && password.trim() !== '' && password.length < 6) {
        return res.status(400).json({ 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }

      const usuario = await Usuario.actualizar(req.params.id, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim(),
        password: password?.trim(),
        rol_id: parseInt(rol_id),
        activo: activo !== undefined ? activo : true
      });
      
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar usuario
  async eliminar(req, res) {
    try {
      await Usuario.eliminar(req.params.id);
      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar múltiples usuarios
  async eliminarMultiples(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ 
          error: 'Se requiere un array de IDs válido' 
        });
      }

      await Usuario.eliminarMultiples(ids);
      res.json({ message: 'Usuarios eliminados correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Login de usuario
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email y contraseña son obligatorios' 
        });
      }

      const usuario = await Usuario.verificarCredenciales(email, password);
      res.json({ 
        message: 'Login exitoso',
        usuario 
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }
};

module.exports = usuarioController;