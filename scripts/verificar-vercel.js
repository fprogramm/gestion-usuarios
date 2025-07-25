#!/usr/bin/env node

/**
 * Script para verificar la configuración en Vercel
 */

require('dotenv').config();

console.log('🔍 Verificando configuración para Vercel...\n');

// Variables requeridas
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'JWT_SECRET'
];

// Variables opcionales (para email)
const optionalVars = [
  'EMAIL_HOST',
  'EMAIL_PORT', 
  'EMAIL_USER',
  'EMAIL_PASS'
];

let hasErrors = false;

// Verificar variables requeridas
console.log('📋 Variables requeridas:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('tu_') || value.includes('aqui')) {
    console.log(`❌ ${varName}: No configurada o usando valor de ejemplo`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: Configurada`);
  }
});

// Verificar variables opcionales
console.log('\n📧 Variables de email (opcionales):');
let emailConfigured = true;
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('tu_') || value.includes('tu_email@gmail.com') || value.includes('tu_app_password')) {
    console.log(`⚠️  ${varName}: No configurada (se usará modo demo)`);
    emailConfigured = false;
  } else {
    console.log(`✅ ${varName}: Configurada`);
  }
});

// Verificar configuración de JWT
console.log('\n🔐 Configuración de seguridad:');
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret && jwtSecret.length >= 32) {
  console.log('✅ JWT_SECRET: Longitud adecuada');
} else {
  console.log('⚠️  JWT_SECRET: Debería tener al menos 32 caracteres');
}

// Verificar configuración de Supabase
console.log('\n🗄️  Configuración de base de datos:');
const supabaseUrl = process.env.SUPABASE_URL;
if (supabaseUrl && supabaseUrl.includes('supabase.co')) {
  console.log('✅ SUPABASE_URL: Formato correcto');
} else {
  console.log('❌ SUPABASE_URL: Formato incorrecto o no configurada');
  hasErrors = true;
}

// Resumen
console.log('\n📊 Resumen:');
if (hasErrors) {
  console.log('❌ Hay errores en la configuración que deben corregirse');
  console.log('\n💡 Para configurar en Vercel:');
  console.log('1. Ve a tu proyecto en vercel.com');
  console.log('2. Settings > Environment Variables');
  console.log('3. Agrega las variables faltantes');
  console.log('4. Redeploy el proyecto');
} else {
  console.log('✅ Configuración básica correcta');
}

if (!emailConfigured) {
  console.log('\n📧 Nota sobre email:');
  console.log('- El sistema funcionará en modo demo (tokens en logs)');
  console.log('- Para producción, configura las variables de email');
  console.log('- Usa Gmail App Passwords para EMAIL_PASS');
}

console.log('\n🚀 Para desplegar en Vercel:');
console.log('1. Conecta tu repositorio a Vercel');
console.log('2. Configura las variables de entorno');
console.log('3. El build se ejecutará automáticamente');

process.exit(hasErrors ? 1 : 0);