// Script para configurar usuario inicial en producción
// Ejecutar una sola vez después del despliegue

const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// Configurar con tus credenciales de producción
const SUPABASE_URL = 'TU_URL_DE_SUPABASE';
const SUPABASE_ANON_KEY = 'TU_CLAVE_ANONIMA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupProduction() {
  try {
    console.log('🚀 Configurando usuario administrador para producción...');
    
    // Datos del administrador (CAMBIAR ESTOS DATOS)
    const adminData = {
      nombre: 'Admin',
      apellido: 'Principal',
      email: 'admin@tudominio.com', // CAMBIAR POR TU EMAIL
      password: 'TuContraseñaSegura123!', // CAMBIAR POR UNA CONTRASEÑA SEGURA
      rol_id: 1 // ID del rol Administrador
    };
    
    // Verificar si ya existe
    const { data: existeAdmin } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', adminData.email)
      .single();
    
    if (existeAdmin) {
      console.log('❌ El usuario administrador ya existe');
      return;
    }
    
    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(adminData.password, 10);
    
    // Crear usuario
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nombre: adminData.nombre,
        apellido: adminData.apellido,
        email: adminData.email,
        password_hash: passwordHash,
        rol_id: adminData.rol_id,
        activo: true
      }])
      .select();
    
    if (error) throw error;
    
    console.log('✅ Usuario administrador creado exitosamente:');
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Contraseña: ${adminData.password}`);
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
    
  } catch (error) {
    console.error('❌ Error al crear administrador:', error.message);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  setupProduction();
}

module.exports = setupProduction;