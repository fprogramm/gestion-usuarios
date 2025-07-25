const supabase = require('../config/database');
const bcrypt = require('bcrypt');

class Usuario {
  static async obtenerTodos(search = null) {
    try {
      let query = supabase
        .from('usuarios')
        .select(`
          *,
          roles (
            id,
            nombre,
            descripcion
          )
        `);
      
      if (search) {
        query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,email.ilike.%${search}%`);
      }
      
      const { data, error } = await query.order('id', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  static async obtenerPorId(id) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          roles (
            id,
            nombre,
            descripcion
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  static async crear(datosUsuario) {
    try {
      const { nombre, apellido, email, password, rol_id } = datosUsuario;
      
      // Verificar si el email ya existe
      const { data: existeEmail } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .single();
      
      if (existeEmail) {
        throw new Error('El email ya está registrado');
      }

      // Encriptar contraseña
      const passwordHash = await bcrypt.hash(password, 10);
      
      const { data, error } = await supabase
        .from('usuarios')
        .insert([{
          nombre,
          apellido,
          email,
          password_hash: passwordHash,
          rol_id,
          activo: true
        }])
        .select(`
          *,
          roles (
            id,
            nombre,
            descripcion
          )
        `);
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  static async actualizar(id, datosUsuario) {
    try {
      const { nombre, apellido, email, password, rol_id, activo } = datosUsuario;
      
      // Verificar si el email ya existe en otro usuario
      if (email) {
        const { data: existeEmail } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', email)
          .neq('id', id)
          .single();
        
        if (existeEmail) {
          throw new Error('El email ya está registrado por otro usuario');
        }
      }

      const updateData = {
        nombre,
        apellido,
        email,
        rol_id,
        activo,
        updated_at: new Date().toISOString()
      };

      // Solo actualizar contraseña si se proporciona
      if (password && password.trim() !== '') {
        updateData.password_hash = await bcrypt.hash(password, 10);
      }

      const { data, error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          roles (
            id,
            nombre,
            descripcion
          )
        `);
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  static async eliminar(id) {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }

  static async eliminarMultiples(ids) {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .in('id', ids);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar usuarios: ${error.message}`);
    }
  }

  static async verificarCredenciales(email, password) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          roles (
            id,
            nombre,
            descripcion
          )
        `)
        .eq('email', email)
        .eq('activo', true)
        .single();
      
      if (error || !data) {
        throw new Error('Credenciales inválidas');
      }

      const passwordValida = await bcrypt.compare(password, data.password_hash);
      if (!passwordValida) {
        throw new Error('Credenciales inválidas');
      }

      // No devolver el hash de la contraseña
      delete data.password_hash;
      return data;
    } catch (error) {
      throw new Error(`Error al verificar credenciales: ${error.message}`);
    }
  }
}

module.exports = Usuario;