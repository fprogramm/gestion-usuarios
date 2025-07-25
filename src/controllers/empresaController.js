const Empresa = require('../models/Empresa');

const empresaController = {
  // Obtener todas las empresas
  async obtenerTodas(req, res) {
    try {
      const { search } = req.query;
      const empresas = await Empresa.obtenerTodas(search);
      res.json(empresas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener empresa por ID
  async obtenerPorId(req, res) {
    try {
      const empresa = await Empresa.obtenerPorId(req.params.id);
      res.json(empresa);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Crear nueva empresa
  async crear(req, res) {
    try {
      const { 
        nombre, 
        razon_social, 
        nit, 
        telefono, 
        email, 
        direccion, 
        ciudad, 
        pais, 
        sitio_web, 
        logo_url, 
        notas 
      } = req.body;
      
      // Validaciones básicas
      if (!nombre) {
        return res.status(400).json({ 
          error: 'El nombre de la empresa es obligatorio' 
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

      // Validar formato de sitio web si se proporciona
      if (sitio_web) {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(sitio_web)) {
          return res.status(400).json({ 
            error: 'El sitio web debe incluir http:// o https://' 
          });
        }
      }

      const empresa = await Empresa.crear({
        nombre: nombre.trim(),
        razon_social: razon_social?.trim(),
        nit: nit?.trim(),
        telefono: telefono?.trim(),
        email: email?.trim(),
        direccion: direccion?.trim(),
        ciudad: ciudad?.trim(),
        pais: pais?.trim() || 'Colombia',
        sitio_web: sitio_web?.trim(),
        logo_url: logo_url?.trim(),
        notas: notas?.trim()
      });
      
      res.status(201).json(empresa);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar empresa
  async actualizar(req, res) {
    try {
      const { 
        nombre, 
        razon_social, 
        nit, 
        telefono, 
        email, 
        direccion, 
        ciudad, 
        pais, 
        sitio_web, 
        logo_url, 
        activa, 
        notas 
      } = req.body;
      
      // Validaciones básicas
      if (!nombre) {
        return res.status(400).json({ 
          error: 'El nombre de la empresa es obligatorio' 
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

      // Validar formato de sitio web si se proporciona
      if (sitio_web) {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(sitio_web)) {
          return res.status(400).json({ 
            error: 'El sitio web debe incluir http:// o https://' 
          });
        }
      }

      const empresa = await Empresa.actualizar(req.params.id, {
        nombre: nombre.trim(),
        razon_social: razon_social?.trim(),
        nit: nit?.trim(),
        telefono: telefono?.trim(),
        email: email?.trim(),
        direccion: direccion?.trim(),
        ciudad: ciudad?.trim(),
        pais: pais?.trim() || 'Colombia',
        sitio_web: sitio_web?.trim(),
        logo_url: logo_url?.trim(),
        activa: activa !== undefined ? activa : true,
        notas: notas?.trim()
      });
      
      res.json(empresa);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar empresa
  async eliminar(req, res) {
    try {
      await Empresa.eliminar(req.params.id);
      res.json({ message: 'Empresa eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar múltiples empresas
  async eliminarMultiples(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ 
          error: 'Se requiere un array de IDs válido' 
        });
      }

      await Empresa.eliminarMultiples(ids);
      res.json({ message: 'Empresas eliminadas correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener estadísticas de empresas
  async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await Empresa.obtenerEstadisticas();
      res.json(estadisticas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = empresaController;