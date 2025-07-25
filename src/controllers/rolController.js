const Rol = require('../models/Rol');

const rolController = {
  // Obtener todos los roles
  async obtenerTodos(req, res) {
    try {
      const roles = await Rol.obtenerTodos();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener rol por ID
  async obtenerPorId(req, res) {
    try {
      const rol = await Rol.obtenerPorId(req.params.id);
      res.json(rol);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Crear nuevo rol
  async crear(req, res) {
    try {
      const { nombre, descripcion } = req.body;
      
      if (!nombre) {
        return res.status(400).json({ 
          error: 'El nombre del rol es obligatorio' 
        });
      }

      const rol = await Rol.crear({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || ''
      });
      
      res.status(201).json(rol);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar rol
  async actualizar(req, res) {
    try {
      const { nombre, descripcion } = req.body;
      
      if (!nombre) {
        return res.status(400).json({ 
          error: 'El nombre del rol es obligatorio' 
        });
      }

      const rol = await Rol.actualizar(req.params.id, {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || ''
      });
      
      res.json(rol);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar rol
  async eliminar(req, res) {
    try {
      await Rol.eliminar(req.params.id);
      res.json({ message: 'Rol eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = rolController;