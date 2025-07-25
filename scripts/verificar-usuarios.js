#!/usr/bin/env node

/**
 * Script para verificar usuarios en la base de datos
 */

require('dotenv').config();
const supabase = require('../src/config/database');

async function verificarUsuarios() {
  console.log('👥 Verificando usuarios en la base de datos...\n');

  try {
    // Obtener todos los usuarios
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nombre,
        apellido,
        email,
        activo,
        email_verificado,
        ultimo_login,
        roles (
          nombre
        )
      `)
      .order('id');

    if (error) {
      console.error('❌ Error consultando usuarios:', error.message);
      return;
    }

    if (!usuarios || usuarios.length === 0) {
      console.log('⚠️  No hay usuarios en la base de datos');
      console.log('\n💡 Para crear usuarios:');
      console.log('1. Ejecuta: npm run seed:admin');
      console.log('2. O crea usuarios manualmente desde el dashboard');
      return;
    }

    console.log(`✅ Encontrados ${usuarios.length} usuarios:\n`);

    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.nombre} ${usuario.apellido}`);
      console.log(`   📧 Email: ${usuario.email}`);
      console.log(`   👤 Rol: ${usuario.roles?.nombre || 'Sin rol'}`);
      console.log(`   🟢 Activo: ${usuario.activo ? 'Sí' : 'No'}`);
      console.log(`   ✉️  Email verificado: ${usuario.email_verificado ? 'Sí' : 'No'}`);
      console.log(`   🕐 Último login: ${usuario.ultimo_login || 'Nunca'}`);
      console.log('');
    });

    // Verificar usuarios activos
    const usuariosActivos = usuarios.filter(u => u.activo);
    console.log(`📊 Resumen:`);
    console.log(`   Total: ${usuarios.length}`);
    console.log(`   Activos: ${usuariosActivos.length}`);
    console.log(`   Inactivos: ${usuarios.length - usuariosActivos.length}`);

    if (usuariosActivos.length === 0) {
      console.log('\n⚠️  No hay usuarios activos. Los usuarios inactivos no pueden solicitar tokens.');
    }

    // Sugerir email para prueba
    const usuarioParaPrueba = usuariosActivos[0];
    if (usuarioParaPrueba) {
      console.log(`\n💡 Para probar el login, usa: ${usuarioParaPrueba.email}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificarUsuarios();