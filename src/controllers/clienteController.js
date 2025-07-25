const Cliente = require('../models/Cliente');

const clienteController = {
  // Obtener todos los clientes
  async obtenerTodos(req, res) {
    try {
      const { search, empresa_id } = req.query;
      const clientes = await Cliente.obtenerTodos(search, empresa_id);
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener cliente por ID
  async obtenerPorId(req, res) {
    try {
      const cliente = await Cliente.obtenerPorId(req.params.id);
      res.json(cliente);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Crear nuevo cliente
  async crear(req, res) {
    try {
      const { 
        empresa_id,
        tipo_documento,
        numero_documento, 
        nombres, 
        apellidos, 
        email, 
        telefono, 
        celular,
        direccion, 
        ciudad, 
        fecha_nacimiento,
        genero,
        estado_civil,
        profesion,
        notas 
      } = req.body;
      
      // Validaciones básicas
      if (!empresa_id || !numero_documento || !nombres || !apellidos) {
        return res.status(400).json({ 
          error: 'Empresa, número de documento, nombres y apellidos son obligatorios' 
        });
      }

      // Validar formato de email si se proporciona
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ 
            error: 'Formato de email inválido' 
          });
        }
      }

      // Validar fecha de nacimiento si se proporciona
      if (fecha_nacimiento) {
        const fecha = new Date(fecha_nacimiento);
        const hoy = new Date();
        if (fecha > hoy) {
          return res.status(400).json({ 
            error: 'La fecha de nacimiento no puede ser futura' 
          });
        }
      }

      // Validar tipo de documento
      const tiposDocumento = ['CC', 'TI', 'CE', 'PP', 'NIT'];
      if (tipo_documento && !tiposDocumento.includes(tipo_documento)) {
        return res.status(400).json({ 
          error: 'Tipo de documento inválido. Debe ser: CC, TI, CE, PP o NIT' 
        });
      }

      // Validar género
      const generos = ['M', 'F', 'Otro'];
      if (genero && !generos.includes(genero)) {
        return res.status(400).json({ 
          error: 'Género inválido. Debe ser: M, F u Otro' 
        });
      }

      const cliente = await Cliente.crear({
        empresa_id: parseInt(empresa_id),
        tipo_documento: tipo_documento || 'CC',
        numero_documento: numero_documento.trim(),
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: email?.trim(),
        telefono: telefono?.trim(),
        celular: celular?.trim(),
        direccion: direccion?.trim(),
        ciudad: ciudad?.trim(),
        fecha_nacimiento: fecha_nacimiento || null,
        genero: genero || null,
        estado_civil: estado_civil?.trim() || null,
        profesion: profesion?.trim(),
        notas: notas?.trim()
      });
      
      res.status(201).json(cliente);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar cliente
  async actualizar(req, res) {
    try {
      const { 
        empresa_id,
        tipo_documento,
        numero_documento, 
        nombres, 
        apellidos, 
        email, 
        telefono, 
        celular,
        direccion, 
        ciudad, 
        fecha_nacimiento,
        genero,
        estado_civil,
        profesion,
        activo,
        notas 
      } = req.body;
      
      // Validaciones básicas
      if (!empresa_id || !numero_documento || !nombres || !apellidos) {
        return res.status(400).json({ 
          error: 'Empresa, número de documento, nombres y apellidos son obligatorios' 
        });
      }

      // Validar formato de email si se proporciona
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ 
            error: 'Formato de email inválido' 
          });
        }
      }

      // Validar fecha de nacimiento si se proporciona
      if (fecha_nacimiento) {
        const fecha = new Date(fecha_nacimiento);
        const hoy = new Date();
        if (fecha > hoy) {
          return res.status(400).json({ 
            error: 'La fecha de nacimiento no puede ser futura' 
          });
        }
      }

      // Validar tipo de documento
      const tiposDocumento = ['CC', 'TI', 'CE', 'PP', 'NIT'];
      if (tipo_documento && !tiposDocumento.includes(tipo_documento)) {
        return res.status(400).json({ 
          error: 'Tipo de documento inválido. Debe ser: CC, TI, CE, PP o NIT' 
        });
      }

      // Validar género
      const generos = ['M', 'F', 'Otro'];
      if (genero && !generos.includes(genero)) {
        return res.status(400).json({ 
          error: 'Género inválido. Debe ser: M, F u Otro' 
        });
      }

      const cliente = await Cliente.actualizar(req.params.id, {
        empresa_id: parseInt(empresa_id),
        tipo_documento: tipo_documento || 'CC',
        numero_documento: numero_documento.trim(),
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: email?.trim(),
        telefono: telefono?.trim(),
        celular: celular?.trim(),
        direccion: direccion?.trim(),
        ciudad: ciudad?.trim(),
        fecha_nacimiento: fecha_nacimiento || null,
        genero: genero || null,
        estado_civil: estado_civil?.trim() || null,
        profesion: profesion?.trim(),
        activo: activo !== undefined ? activo : true,
        notas: notas?.trim()
      });
      
      res.json(cliente);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar cliente
  async eliminar(req, res) {
    try {
      await Cliente.eliminar(req.params.id);
      res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar múltiples clientes
  async eliminarMultiples(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ 
          error: 'Se requiere un array de IDs válido' 
        });
      }

      await Cliente.eliminarMultiples(ids);
      res.json({ message: 'Clientes eliminados correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener clientes por empresa
  async obtenerPorEmpresa(req, res) {
    try {
      const clientes = await Cliente.obtenerPorEmpresa(req.params.empresaId);
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener estadísticas de clientes
  async obtenerEstadisticas(req, res) {
    try {
      const { empresa_id } = req.query;
      const estadisticas = await Cliente.obtenerEstadisticas(empresa_id);
      res.json(estadisticas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = clienteController;