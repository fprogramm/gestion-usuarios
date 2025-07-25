const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../config/database');
const emailService = require('./emailService');

class AuthService {
  // Generar token aleatorio de 6 dígitos
  generarTokenLogin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generar JWT
  generarJWT(usuario) {
    const payload = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.roles?.nombre || 'Usuario'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  }

  // Verificar JWT
  verificarJWT(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  // Solicitar token de login por email
  async solicitarTokenLogin(email, ipAddress, userAgent) {
    try {
      // Verificar si el usuario existe y está activo
      const { data: usuario, error: userError } = await supabase
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

      if (userError || !usuario) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      // Invalidar tokens anteriores del mismo tipo
      await supabase
        .from('auth_tokens')
        .update({ usado: true })
        .eq('usuario_id', usuario.id)
        .eq('tipo', 'login')
        .eq('usado', false);

      // Generar nuevo token
      const token = this.generarTokenLogin();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      // Guardar token en base de datos
      const { error: tokenError } = await supabase
        .from('auth_tokens')
        .insert([{
          usuario_id: usuario.id,
          token,
          tipo: 'login',
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent
        }]);

      if (tokenError) throw tokenError;

      // Enviar token por email
      const emailResult = await emailService.enviarTokenLogin(
        email, 
        token, 
        `${usuario.nombre} ${usuario.apellido}`
      );

      if (!emailResult.success) {
        throw new Error('Error al enviar email: ' + emailResult.message);
      }

      return {
        success: true,
        message: 'Token enviado al email correctamente',
        expiresIn: '15 minutos'
      };

    } catch (error) {
      throw new Error(`Error al solicitar token: ${error.message}`);
    }
  }

  // Verificar token y generar JWT
  async verificarTokenLogin(email, token, ipAddress, userAgent) {
    try {
      // Buscar token válido
      const { data: authToken, error: tokenError } = await supabase
        .from('auth_tokens')
        .select(`
          *,
          usuarios (
            *,
            roles (
              id,
              nombre,
              descripcion
            )
          )
        `)
        .eq('token', token)
        .eq('tipo', 'login')
        .eq('usado', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !authToken) {
        throw new Error('Token inválido o expirado');
      }

      const usuario = authToken.usuarios;

      // Verificar que el email coincida
      if (usuario.email !== email) {
        throw new Error('Token no válido para este email');
      }

      // Marcar token como usado
      await supabase
        .from('auth_tokens')
        .update({ usado: true })
        .eq('id', authToken.id);

      // Generar JWT
      const jwtToken = this.generarJWT(usuario);
      const jwtHash = crypto.createHash('sha256').update(jwtToken).digest('hex');

      // Guardar sesión
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
      await supabase
        .from('sesiones')
        .insert([{
          usuario_id: usuario.id,
          jwt_token_hash: jwtHash,
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent
        }]);

      // Actualizar último login
      await supabase
        .from('usuarios')
        .update({ ultimo_login: new Date().toISOString() })
        .eq('id', usuario.id);

      return {
        success: true,
        message: 'Login exitoso',
        token: jwtToken,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.roles?.nombre || 'Usuario'
        }
      };

    } catch (error) {
      throw new Error(`Error al verificar token: ${error.message}`);
    }
  }

  // Cerrar sesión
  async cerrarSesion(jwtToken) {
    try {
      const jwtHash = crypto.createHash('sha256').update(jwtToken).digest('hex');
      
      await supabase
        .from('sesiones')
        .update({ activa: false })
        .eq('jwt_token_hash', jwtHash);

      return { success: true, message: 'Sesión cerrada correctamente' };
    } catch (error) {
      throw new Error(`Error al cerrar sesión: ${error.message}`);
    }
  }

  // Verificar si la sesión es válida
  async verificarSesion(jwtToken) {
    try {
      const payload = this.verificarJWT(jwtToken);
      const jwtHash = crypto.createHash('sha256').update(jwtToken).digest('hex');

      const { data: sesion, error } = await supabase
        .from('sesiones')
        .select('*')
        .eq('jwt_token_hash', jwtHash)
        .eq('activa', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !sesion) {
        throw new Error('Sesión inválida o expirada');
      }

      return { valid: true, usuario: payload };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Limpiar tokens y sesiones expiradas
  async limpiarExpirados() {
    try {
      const now = new Date().toISOString();
      
      // Limpiar tokens expirados
      await supabase
        .from('auth_tokens')
        .delete()
        .lt('expires_at', now);

      // Desactivar sesiones expiradas
      await supabase
        .from('sesiones')
        .update({ activa: false })
        .lt('expires_at', now);

      return { success: true, message: 'Limpieza completada' };
    } catch (error) {
      console.error('Error limpiando expirados:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new AuthService();