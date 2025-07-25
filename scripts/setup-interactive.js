const readline = require('readline');
const bcrypt = require('bcrypt');
const supabase = require('../src/config/database');

// Configurar readline para input interactivo
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función helper para hacer preguntas
function pregunta(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Validar email
function validarEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar contraseña
function validarPassword(password) {
  if (password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe tener al menos una mayúscula' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe tener al menos una minúscula' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'La contraseña debe tener al menos un número' };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { valid: false, message: 'La contraseña debe tener al menos un carácter especial (!@#$%^&*)' };
  }
  return { valid: true };
}

async function setupInteractivo() {
  try {
    console.log('\n🌱 CONFIGURACIÓN INTERACTIVA DEL SISTEMA');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Este script te ayudará a crear el primer usuario administrador');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 1. Verificar conexión a Supabase
    console.log('🔍 Verificando conexión a Supabase...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('roles')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Error de conexión a Supabase:', connectionError.message);
      console.log('💡 Verifica que las variables SUPABASE_URL y SUPABASE_ANON_KEY estén configuradas');
      process.exit(1);
    }
    console.log('✅ Conexión a Supabase exitosa\n');

    // 2. Verificar/crear roles
    console.log('📋 Verificando roles del sistema...');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('id');

    if (rolesError) {
      console.error('❌ Error al obtener roles:', rolesError);
      process.exit(1);
    }

    if (!roles || roles.length === 0) {
      console.log('📝 No se encontraron roles. Creando roles por defecto...');
      
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
        process.exit(1);
      }

      console.log('✅ Roles creados correctamente');
    } else {
      console.log(`✅ Encontrados ${roles.length} roles existentes`);
    }

    // 3. Mostrar roles disponibles
    const { data: rolesActualizados } = await supabase
      .from('roles')
      .select('*')
      .order('id');

    console.log('\n🛡️  Roles disponibles:');
    rolesActualizados.forEach((rol, index) => {
      console.log(`   ${index + 1}. ${rol.nombre} - ${rol.descripcion}`);
    });

    // 4. Recopilar información del usuario
    console.log('\n👤 INFORMACIÓN DEL USUARIO ADMINISTRADOR');
    console.log('─────────────────────────────────────────────────────────────\n');

    let nombre, apellido, email, password, rolSeleccionado;

    // Nombre
    do {
      nombre = await pregunta('📝 Nombre: ');
      if (!nombre.trim()) {
        console.log('❌ El nombre no puede estar vacío');
      }
    } while (!nombre.trim());

    // Apellido
    do {
      apellido = await pregunta('📝 Apellido: ');
      if (!apellido.trim()) {
        console.log('❌ El apellido no puede estar vacío');
      }
    } while (!apellido.trim());

    // Email
    do {
      email = await pregunta('📧 Email: ');
      if (!validarEmail(email)) {
        console.log('❌ Formato de email inválido');
        continue;
      }

      // Verificar si el email ya existe
      const { data: emailExistente } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .single();

      if (emailExistente) {
        console.log('❌ Ya existe un usuario con este email');
        email = '';
      }
    } while (!email || !validarEmail(email));

    // Contraseña
    do {
      password = await pregunta('🔐 Contraseña (mín. 8 caracteres, mayús, minús, número, especial): ');
      const validacion = validarPassword(password);
      if (!validacion.valid) {
        console.log('❌', validacion.message);
        password = '';
      }
    } while (!password);

    // Rol
    do {
      const rolInput = await pregunta(`🛡️  Selecciona el rol (1-${rolesActualizados.length}) [1 para Administrador]: `) || '1';
      const rolIndex = parseInt(rolInput) - 1;
      
      if (rolIndex >= 0 && rolIndex < rolesActualizados.length) {
        rolSeleccionado = rolesActualizados[rolIndex];
      } else {
        console.log('❌ Selección inválida');
      }
    } while (!rolSeleccionado);

    // 5. Confirmar información
    console.log('\n📋 RESUMEN DE LA CONFIGURACIÓN');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`👤 Nombre completo: ${nombre} ${apellido}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🛡️  Rol: ${rolSeleccionado.nombre}`);
    console.log(`🔐 Contraseña: ${'*'.repeat(password.length)}`);
    console.log('─────────────────────────────────────────────────────────────');

    const confirmacion = await pregunta('\n✅ ¿Confirmas la creación del usuario? (s/N): ');
    
    if (confirmacion.toLowerCase() !== 's' && confirmacion.toLowerCase() !== 'si') {
      console.log('❌ Operación cancelada');
      rl.close();
      return;
    }

    // 6. Crear usuario
    console.log('\n🔐 Encriptando contraseña...');
    const passwordHash = await bcrypt.hash(password, 12);

    console.log('👤 Creando usuario administrador...');
    const { data: nuevoUsuario, error: createError } = await supabase
      .from('usuarios')
      .insert([{
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        rol_id: rolSeleccionado.id,
        activo: true,
        email_verificado: true
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
      console.error('❌ Error creando usuario:', createError);
      rl.close();
      return;
    }

    // 7. Mostrar resultado exitoso
    console.log('\n🎉 ¡USUARIO CREADO EXITOSAMENTE!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`👤 Usuario: ${nombre} ${apellido}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🛡️  Rol: ${rolSeleccionado.nombre}`);
    console.log(`🆔 ID: ${nuevoUsuario[0].id}`);
    console.log('✅ Estado: Activo y verificado');
    console.log('═══════════════════════════════════════════════════════════════');

    console.log('\n⚠️  IMPORTANTE - GUARDA ESTA INFORMACIÓN:');
    console.log(`📧 Email de login: ${email}`);
    console.log(`🔑 Contraseña: ${password}`);
    console.log('\n🌐 URLs de acceso:');
    console.log('   • Local: http://localhost:3000/login.html');
    console.log('   • Producción: https://tu-app.vercel.app/login.html');

    console.log('\n💡 Próximos pasos:');
    console.log('1. Configura las variables de entorno para email en Vercel');
    console.log('2. Haz login con las credenciales creadas');
    console.log('3. Cambia la contraseña después del primer login');
    console.log('4. Crea otros usuarios según sea necesario');

    // 8. Mostrar estadísticas finales
    await mostrarEstadisticasFinales();

  } catch (error) {
    console.error('💥 Error inesperado:', error);
  } finally {
    rl.close();
  }
}

async function mostrarEstadisticasFinales() {
  try {
    console.log('\n📊 ESTADÍSTICAS DEL SISTEMA');
    console.log('─────────────────────────────────────────────────────────────');

    const { data: usuarios } = await supabase
      .from('usuarios')
      .select(`
        *,
        roles (nombre)
      `);

    if (usuarios) {
      const stats = {};
      usuarios.forEach(usuario => {
        const rol = usuario.roles?.nombre || 'Sin rol';
        const estado = usuario.activo ? 'activos' : 'inactivos';
        
        if (!stats[rol]) {
          stats[rol] = { activos: 0, inactivos: 0, total: 0 };
        }
        
        stats[rol][estado]++;
        stats[rol].total++;
      });

      Object.entries(stats).forEach(([rol, counts]) => {
        console.log(`${rol}: ${counts.total} total (${counts.activos} activos, ${counts.inactivos} inactivos)`);
      });

      console.log(`\nTotal de usuarios: ${usuarios.length}`);
    }

    console.log('─────────────────────────────────────────────────────────────');
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupInteractivo().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = setupInteractivo;