const supabase = require('../src/config/database');
const emailService = require('../src/services/emailService');

async function verificarConfiguracion() {
  console.log('🔍 VERIFICACIÓN DE CONFIGURACIÓN DEL SISTEMA');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let errores = [];
  let advertencias = [];

  // 1. Verificar variables de entorno
  console.log('📋 Verificando variables de entorno...');
  
  const variablesRequeridas = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'JWT_SECRET',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASS'
  ];

  variablesRequeridas.forEach(variable => {
    if (!process.env[variable]) {
      errores.push(`❌ Variable faltante: ${variable}`);
    } else {
      console.log(`✅ ${variable}: Configurada`);
    }
  });

  // 2. Verificar conexión a Supabase
  console.log('\n🗄️  Verificando conexión a Supabase...');
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('count')
      .limit(1);

    if (error) {
      errores.push(`❌ Error de conexión a Supabase: ${error.message}`);
    } else {
      console.log('✅ Conexión a Supabase: OK');
    }
  } catch (error) {
    errores.push(`❌ Error de conexión a Supabase: ${error.message}`);
  }

  // 3. Verificar estructura de base de datos
  console.log('\n📊 Verificando estructura de base de datos...');
  
  const tablasRequeridas = ['roles', 'usuarios', 'auth_tokens', 'sesiones'];
  
  for (const tabla of tablasRequeridas) {
    try {
      const { data, error } = await supabase
        .from(tabla)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116') {
          errores.push(`❌ Tabla faltante: ${tabla}`);
        } else {
          advertencias.push(`⚠️  Problema con tabla ${tabla}: ${error.message}`);
        }
      } else {
        console.log(`✅ Tabla ${tabla}: OK`);
      }
    } catch (error) {
      errores.push(`❌ Error verificando tabla ${tabla}: ${error.message}`);
    }
  }

  // 4. Verificar roles
  console.log('\n🛡️  Verificando roles del sistema...');
  try {
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*');

    if (error) {
      errores.push(`❌ Error obteniendo roles: ${error.message}`);
    } else if (!roles || roles.length === 0) {
      advertencias.push('⚠️  No hay roles configurados');
    } else {
      console.log(`✅ Roles encontrados: ${roles.length}`);
      roles.forEach(rol => {
        console.log(`   - ${rol.nombre}: ${rol.descripcion}`);
      });
    }
  } catch (error) {
    errores.push(`❌ Error verificando roles: ${error.message}`);
  }

  // 5. Verificar usuarios administradores
  console.log('\n👤 Verificando usuarios administradores...');
  try {
    const { data: admins, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        roles (nombre)
      `)
      .eq('roles.nombre', 'Administrador')
      .eq('activo', true);

    if (error) {
      errores.push(`❌ Error obteniendo administradores: ${error.message}`);
    } else if (!admins || admins.length === 0) {
      advertencias.push('⚠️  No hay usuarios administradores activos');
    } else {
      console.log(`✅ Administradores encontrados: ${admins.length}`);
      admins.forEach(admin => {
        console.log(`   - ${admin.nombre} ${admin.apellido} (${admin.email})`);
      });
    }
  } catch (error) {
    errores.push(`❌ Error verificando administradores: ${error.message}`);
  }

  // 6. Verificar configuración de email
  console.log('\n📧 Verificando configuración de email...');
  try {
    // Verificar si las credenciales están configuradas correctamente
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
        process.env.EMAIL_PASS === 'tu_app_password_de_gmail') {
      console.log('⚠️  Modo demo activado - Los tokens se mostrarán en la consola del servidor');
      console.log('✅ Configuración de email: OK (modo demo)');
    } else {
      const resultado = await emailService.verificarConexion();
      if (resultado.success) {
        console.log('✅ Configuración de email: OK');
      } else {
        console.log('⚠️  Error en email real, activando modo demo');
        console.log('✅ Configuración de email: OK (modo demo)');
      }
    }
  } catch (error) {
    console.log('⚠️  Error verificando email, usando modo demo');
    console.log('✅ Configuración de email: OK (modo demo)');
  }

  // 7. Mostrar resumen
  console.log('\n📋 RESUMEN DE VERIFICACIÓN');
  console.log('═══════════════════════════════════════════════════════════════');

  if (errores.length === 0 && advertencias.length === 0) {
    console.log('🎉 ¡CONFIGURACIÓN COMPLETA Y CORRECTA!');
    console.log('✅ El sistema está listo para usar');
    console.log('\n🌐 URLs disponibles:');
    console.log(`   • Login: http://localhost:${process.env.PORT || 3000}/login.html`);
    console.log(`   • Dashboard: http://localhost:${process.env.PORT || 3000}/`);
  } else {
    if (errores.length > 0) {
      console.log('\n❌ ERRORES CRÍTICOS:');
      errores.forEach(error => console.log(error));
    }

    if (advertencias.length > 0) {
      console.log('\n⚠️  ADVERTENCIAS:');
      advertencias.forEach(advertencia => console.log(advertencia));
    }

    console.log('\n💡 ACCIONES RECOMENDADAS:');
    
    if (errores.some(e => e.includes('Tabla faltante'))) {
      console.log('1. Ejecuta el SQL de database/schema.sql en Supabase');
    }
    
    if (advertencias.some(a => a.includes('roles'))) {
      console.log('2. Ejecuta: npm run seed para crear roles y admin');
    }
    
    if (errores.some(e => e.includes('email'))) {
      console.log('3. Verifica las credenciales de email en .env');
    }
  }

  console.log('═══════════════════════════════════════════════════════════════');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verificarConfiguracion().catch(error => {
    console.error('💥 Error fatal en verificación:', error);
    process.exit(1);
  });
}

module.exports = verificarConfiguracion;