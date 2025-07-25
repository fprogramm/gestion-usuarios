const supabase = require('../config/database');

class Cliente {
  static async obtenerTodos(search = null, empresaId = null) {
    try {
      let query = supabase
        .from('clientes')
        .select(`
          *,
          empresas (
            id,
            nombre,
            nit,
            ciudad
          )
        `);
      
      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }
      
      if (search) {
        query = query.or(`nombres.ilike.%${search}%,apellidos.ilike.%${search}%,numero_documento.ilike.%${search}%,email.ilike.%${search}%,telefono.ilike.%${search}%,celular.ilike.%${search}%`);
      }
      
      const { data, error } = await query.order('apellidos', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Error al obtener clientes: ${error.message}`);
    }
  }

  static async obtenerPorId(id) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select(`
          *,
          empresas (
            id,
            nombre,
            razon_social,
            nit,
            telefono,
            email,
            direccion,
            ciudad
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Error al obtener cliente: ${error.message}`);
    }
  }

  static async crear(datosCliente) {
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
      } = datosCliente;
      
      // Verificar si el documento ya existe en la empresa
      const { data: existeDocumento } = await supabase
        .from('clientes')
        .select('id')
        .eq('empresa_id', empresa_id)
        .eq('numero_documento', numero_documento)
        .single();
      
      if (existeDocumento) {
        throw new Error('Ya existe un cliente con este número de documento en la empresa');
      }

      // Verificar si el email ya existe en la empresa (si se proporciona)
      if (email) {
        const { data: existeEmail } = await supabase
          .from('clientes')
          .select('id')
          .eq('empresa_id', empresa_id)
          .eq('email', email.toLowerCase())
          .single();
        
        if (existeEmail) {
          throw new Error('Ya existe un cliente con este email en la empresa');
        }
      }

      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          empresa_id: parseInt(empresa_id),
          tipo_documento: tipo_documento || 'CC',
          numero_documento: numero_documento.trim(),
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          email: email?.toLowerCase().trim() || null,
          telefono: telefono?.trim() || null,
          celular: celular?.trim() || null,
          direccion: direccion?.trim() || null,
          ciudad: ciudad?.trim() || null,
          fecha_nacimiento: fecha_nacimiento || null,
          genero: genero || null,
          estado_civil: estado_civil || null,
          profesion: profesion?.trim() || null,
          notas: notas?.trim() || null,
          activo: true
        }])
        .select(`
          *,
          empresas (
            id,
            nombre,
            nit,
            ciudad
          )
        `);
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw new Error(`Error al crear cliente: ${error.message}`);
    }
  }

  static async actualizar(id, datosCliente) {
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
      } = datosCliente;
      
      // Verificar si el documento ya existe en otra cliente de la misma empresa
      const { data: existeDocumento } = await supabase
        .from('clientes')
        .select('id')
        .eq('empresa_id', empresa_id)
        .eq('numero_documento', numero_documento)
        .neq('id', id)
        .single();
      
      if (existeDocumento) {
        throw new Error('Ya existe otro cliente con este número de documento en la empresa');
      }

      // Verificar si el email ya existe en otro cliente de la misma empresa
      if (email) {
        const { data: existeEmail } = await supabase
          .from('clientes')
          .select('id')
          .eq('empresa_id', empresa_id)
          .eq('email', email.toLowerCase())
          .neq('id', id)
          .single();
        
        if (existeEmail) {
          throw new Error('Ya existe otro cliente con este email en la empresa');
        }
      }

      const updateData = {
        empresa_id: parseInt(empresa_id),
        tipo_documento: tipo_documento || 'CC',
        numero_documento: numero_documento.trim(),
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: email?.toLowerCase().trim() || null,
        telefono: telefono?.trim() || null,
        celular: celular?.trim() || null,
        direccion: direccion?.trim() || null,
        ciudad: ciudad?.trim() || null,
        fecha_nacimiento: fecha_nacimiento || null,
        genero: genero || null,
        estado_civil: estado_civil || null,
        profesion: profesion?.trim() || null,
        activo: activo !== undefined ? activo : true,
        notas: notas?.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('clientes')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          empresas (
            id,
            nombre,
            nit,
            ciudad
          )
        `);
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw new Error(`Error al actualizar cliente: ${error.message}`);
    }
  }

  static async eliminar(id) {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar cliente: ${error.message}`);
    }
  }

  static async eliminarMultiples(ids) {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .in('id', ids);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar clientes: ${error.message}`);
    }
  }

  static async obtenerPorEmpresa(empresaId) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('activo', true)
        .order('apellidos', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Error al obtener clientes por empresa: ${error.message}`);
    }
  }

  static async obtenerEstadisticas(empresaId = null) {
    try {
      let query = supabase
        .from('clientes')
        .select(`
          id,
          activo,
          genero,
          empresa_id,
          empresas (nombre)
        `);

      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data: clientes, error } = await query;

      if (error) throw error;

      const estadisticas = {
        total: clientes.length,
        activos: clientes.filter(c => c.activo).length,
        inactivos: clientes.filter(c => !c.activo).length,
        porGenero: {
          masculino: clientes.filter(c => c.genero === 'M').length,
          femenino: clientes.filter(c => c.genero === 'F').length,
          otro: clientes.filter(c => c.genero === 'Otro').length,
          noEspecificado: clientes.filter(c => !c.genero).length
        }
      };

      if (!empresaId) {
        // Estadísticas por empresa
        const empresasStats = {};
        clientes.forEach(cliente => {
          const empresaNombre = cliente.empresas?.nombre || 'Sin empresa';
          if (!empresasStats[empresaNombre]) {
            empresasStats[empresaNombre] = 0;
          }
          empresasStats[empresaNombre]++;
        });
        estadisticas.porEmpresa = empresasStats;
      }

      return estadisticas;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
}

module.exports = Cliente;