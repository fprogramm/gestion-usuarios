const bcrypt = require('bcrypt');
const supabase = require('../src/config/database');

async function crearAdminInicial() {
  try {
    console.log('🚀 Creando usuario administrador inicial...');
    
    // Datos del administrador
    const adminData = {
      nombre: 'Administrador',
      apellido: 'Sistema',
      email: 'admin@sistema.com',
      password: 'admin123456', // Cambiar por una contraseña segura
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

crearAdminInicial();