const supabase = require('../config/database');

class Empresa {
  static async obtenerTodas(search = null) {
    try {
      let query = supabase
        .from('empresas')
        .select(`
          *,
          clientes (count)
        `);
      
      if (search) {
        query = query.or(`nombre.ilike.%${search}%,razon_social.ilike.%${search}%,nit.ilike.%${search}%,ciudad.ilike.%${search}%`);
      }
      
      const { data, error } = await query.order('nombre', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Error al obtener empresas: ${error.message}`);
    }
  }

  static async obtenerPorId(id) {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select(`
          *,
          clientes (
            id,
            nombres,
            apellidos,
            email,
            telefono,
            activo
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Error al obtener empresa: ${error.message}`);
    }
  }

  static async crear(datosEmpresa) {
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
      } = datosEmpresa;
      
      // Verificar si el NIT ya existe (si se proporciona)
      if (nit) {
        const { data: existeNit } = await supabase
          .from('empresas')
          .select('id')
          .eq('nit', nit)
          .single();
        
        if (existeNit) {
          throw new Error('Ya existe una empresa con este NIT');
        }
      }

      const { data, error } = await supabase
        .from('empresas')
        .insert([{
          nombre: nombre.trim(),
          razon_social: razon_social?.trim() || null,
          nit: nit?.trim() || null,
          telefono: telefono?.trim() || null,
          email: email?.toLowerCase().trim() || null,
          direccion: direccion?.trim() || null,
          ciudad: ciudad?.trim() || null,
          pais: pais?.trim() || 'Colombia',
          sitio_web: sitio_web?.trim() || null,
          logo_url: logo_url?.trim() || null,
          notas: notas?.trim() || null,
          activa: true
        }])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw new Error(`Error al crear empresa: ${error.message}`);
    }
  }

  static async actualizar(id, datosEmpresa) {
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
      } = datosEmpresa;
      
      // Verificar si el NIT ya existe en otra empresa
      if (nit) {
        const { data: existeNit } = await supabase
          .from('empresas')
          .select('id')
          .eq('nit', nit)
          .neq('id', id)
          .single();
        
        if (existeNit) {
          throw new Error('Ya existe otra empresa con este NIT');
        }
      }

      const updateData = {
        nombre: nombre.trim(),
        razon_social: razon_social?.trim() || null,
        nit: nit?.trim() || null,
        telefono: telefono?.trim() || null,
        email: email?.toLowerCase().trim() || null,
        direccion: direccion?.trim() || null,
        ciudad: ciudad?.trim() || null,
        pais: pais?.trim() || 'Colombia',
        sitio_web: sitio_web?.trim() || null,
        logo_url: logo_url?.trim() || null,
        activa: activa !== undefined ? activa : true,
        notas: notas?.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('empresas')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw new Error(`Error al actualizar empresa: ${error.message}`);
    }
  }

  static async eliminar(id) {
    try {
      // Verificar si hay clientes asociados
      const { data: clientesAsociados } = await supabase
        .from('clientes')
        .select('id')
        .eq('empresa_id', id)
        .limit(1);
      
      if (clientesAsociados && clientesAsociados.length > 0) {
        throw new Error('No se puede eliminar la empresa porque tiene clientes asociados');
      }

      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar empresa: ${error.message}`);
    }
  }

  static async eliminarMultiples(ids) {
    try {
      // Verificar si alguna empresa tiene clientes asociados
      const { data: clientesAsociados } = await supabase
        .from('clientes')
        .select('empresa_id')
        .in('empresa_id', ids);
      
      if (clientesAsociados && clientesAsociados.length > 0) {
        const empresasConClientes = [...new Set(clientesAsociados.map(c => c.empresa_id))];
        throw new Error(`No se pueden eliminar las empresas con IDs ${empresasConClientes.join(', ')} porque tienen clientes asociados`);
      }

      const { error } = await supabase
        .from('empresas')
        .delete()
        .in('id', ids);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar empresas: ${error.message}`);
    }
  }

  static async obtenerEstadisticas() {
    try {
      const { data: stats, error } = await supabase
        .from('empresas')
        .select(`
          id,
          activa,
          clientes (count)
        `);

      if (error) throw error;

      const estadisticas = {
        total: stats.length,
        activas: stats.filter(e => e.activa).length,
        inactivas: stats.filter(e => !e.activa).length,
        totalClientes: stats.reduce((sum, e) => sum + (e.clientes?.[0]?.count || 0), 0)
      };

      return estadisticas;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
}

module.exports = Empresa;