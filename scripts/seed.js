const bcrypt = require('bcrypt');
const supabase = require('../src/config/database');

// Configuración del usuario administrador inicial
const ADMIN_CONFIG = {
  nombre: 'Administrador',
  apellido: 'Sistema',
  email: 'admin@sistema.com', // CAMBIAR POR TU EMAIL
  password: 'Admin123456!', // CAMBIAR POR UNA CONTRASEÑA SEGURA
  rol: 'Administrador'
};

async function crearUsuarioAdmin() {
  try {
    console.log('🚀 Iniciando proceso de seed...');
    console.log('📋 Verificando roles existentes...');

    // 1. Verificar que existan los roles
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('id');

    if (rolesError) {
      console.error('❌ Error al obtener roles:', rolesError);
      return;
    }

    if (!roles || roles.length === 0) {
      console.log('📝 Creando roles por defecto...');
      
      const rolesDefault = [
        { nombre: 'Administrador', descripcion: 'Acceso completo al sistema' },
        { nombre: 'Editor', descripcion: 'Puede crear y editar contenido' },
        { nombre: 'Usuario', descripcion: 'Acceso básico de solo lectura' },
        { nombre: 'Moderador', descripcion: 'Puede moderar contenido y usuarios' }
      ];

      const { error: insertRolesError } = await supabase
        .from('roles')
        .insert(rolesDefault);

      if (insertRolesError) {
        console.error('❌ Error creando roles:', insertRolesError);
        return;
      }

      console.log('✅ Roles creados correctamente');
    } else {
      console.log(`✅ Encontrados ${roles.length} roles existentes`);
    }

    // 2. Obtener el rol de Administrador
    const { data: rolAdmin, error: rolError } = await supabase
      .from('roles')
      .select('id')
      .eq('nombre', ADMIN_CONFIG.rol)
      .single();

    if (rolError || !rolAdmin) {
      console.error('❌ No se encontró el rol de Administrador');
      return;
    }

    console.log(`✅ Rol de Administrador encontrado (ID: ${rolAdmin.id})`);

    // 3. Verificar si ya existe un usuario administrador
    const { data: adminExistente, error: adminError } = await supabase
      .from('usuarios')
      .select('id, email')
      .eq('email', ADMIN_CONFIG.email)
      .single();

    if (adminExistente) {
      console.log('⚠️  Ya existe un usuario con el email:', ADMIN_CONFIG.email);
      console.log('💡 Si quieres crear un nuevo admin, cambia el email en ADMIN_CONFIG');
      return;
    }

    // 4. Verificar si ya existe algún administrador
    const { data: adminsExistentes, error: adminsError } = await supabase
      .from('usuarios')
      .select('id, nombre, apellido, email')
      .eq('rol_id', rolAdmin.id)
      .eq('activo', true);

    if (adminsExistentes && adminsExistentes.length > 0) {
      console.log('⚠️  Ya existen administradores en el sistema:');
      adminsExistentes.forEach(admin => {
        console.log(`   - ${admin.nombre} ${admin.apellido} (${admin.email})`);
      });
      console.log('❓ ¿Quieres crear otro administrador? (continúa el proceso)');
    }

    // 5. Encriptar contraseña
    console.log('🔐 Encriptando contraseña...');
    const passwordHash = await bcrypt.hash(ADMIN_CONFIG.password, 12);

    // 6. Crear usuario administrador
    console.log('👤 Creando usuario administrador...');
    const { data: nuevoAdmin, error: createError } = await supabase
      .from('usuarios')
      .insert([{
        nombre: ADMIN_CONFIG.nombre,
        apellido: ADMIN_CONFIG.apellido,
        email: ADMIN_CONFIG.email,
        password_hash: passwordHash,
        rol_id: rolAdmin.id,
        activo: true,
        email_verificado: true // Admin pre-verificado
      }])
      .select(`
        *,
        roles (
          id,
          nombre,
          descripcion
        )
      `);

    if (createError) {
      console.error('❌ Error creando usuario administrador:', createError);
      return;
    }

    // 7. Mostrar resultado exitoso
    console.log('\n🎉 ¡Usuario administrador creado exitosamente!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', ADMIN_CONFIG.email);
    console.log('🔑 Contraseña:', ADMIN_CONFIG.password);
    console.log('👤 Nombre:', `${ADMIN_CONFIG.nombre} ${ADMIN_CONFIG.apellido}`);
    console.log('🛡️  Rol:', ADMIN_CONFIG.rol);
    console.log('✅ Estado: Activo y verificado');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANTE:');
    console.log('1. Cambia la contraseña después del primer login');
    console.log('2. Guarda estas credenciales en un lugar seguro');
    console.log('3. No compartas estas credenciales');
    console.log('\n🌐 Puedes hacer login en:');
    console.log('   Local: http://localhost:3000/login.html');
    console.log('   Producción: https://tu-app.vercel.app/login.html');

  } catch (error) {
    console.error('💥 Error inesperado:', error);
  }
}

// Función para mostrar estadísticas del sistema
async function mostrarEstadisticas() {
  try {
    console.log('\n📊 Estadísticas del Sistema:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Contar usuarios por rol
    const { data: usuariosPorRol, error } = await supabase
      .from('usuarios')
      .select(`
        rol_id,
        activo,
        roles (
          nombre
        )
      `);

    if (!error && usuariosPorRol) {
      const stats = {};
      usuariosPorRol.forEach(usuario => {
        const rolNombre = usuario.roles?.nombre || 'Sin rol';
        const estado = usuario.activo ? 'activos' : 'inactivos';
        
        if (!stats[rolNombre]) {
          stats[rolNombre] = { activos: 0, inactivos: 0, total: 0 };
        }
        
        stats[rolNombre][estado]++;
        stats[rolNombre].total++;
      });

      Object.entries(stats).forEach(([rol, counts]) => {
        console.log(`${rol}: ${counts.total} total (${counts.activos} activos, ${counts.inactivos} inactivos)`);
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
  }
}

// Función principal
async function main() {
  console.log('🌱 SEED - Configuración Inicial del Sistema');
  console.log('═══════════════════════════════════════════════════════════════');
  
  await crearUsuarioAdmin();
  await mostrarEstadisticas();
  
  console.log('\n✨ Proceso de seed completado');
  process.exit(0);
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error fatal en seed:', error);
    process.exit(1);
  });
}

module.exports = {
  crearUsuarioAdmin,
  mostrarEstadisticas
};