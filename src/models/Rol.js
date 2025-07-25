const supabase = require('../config/database');

class Rol {
  static async obtenerTodos() {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Error al obtener roles: ${error.message}`);
    }
  }

  static async obtenerPorId(id) {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Error al obtener rol: ${error.message}`);
    }
  }

  static async crear(datosRol) {
    try {
      const { nombre, descripcion } = datosRol;
      
      const { data, error } = await supabase
        .from('roles')
        .insert([{ nombre, descripcion }])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw new Error(`Error al crear rol: ${error.message}`);
    }
  }

  static async actualizar(id, datosRol) {
    try {
      const { nombre, descripcion } = datosRol;
      
      const { data, error } = await supabase
        .from('roles')
        .update({ nombre, descripcion })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw new Error(`Error al actualizar rol: ${error.message}`);
    }
  }

  static async eliminar(id) {
    try {
      // Verificar si hay usuarios con este rol
      const { data: usuariosConRol } = await supabase
        .from('usuarios')
        .select('id')
        .eq('rol_id', id)
        .limit(1);
      
      if (usuariosConRol && usuariosConRol.length > 0) {
        throw new Error('No se puede eliminar el rol porque tiene usuarios asignados');
      }

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar rol: ${error.message}`);
    }
  }
}

module.exports = Rol;