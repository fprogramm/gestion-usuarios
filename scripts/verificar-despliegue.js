#!/usr/bin/env node

/**
 * Script para verificar que el despliegue funcione correctamente
 */

const https = require('https');
const http = require('http');

async function verificarURL(url, descripcion) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      const contentType = res.headers['content-type'] || '';
      
      console.log(`${descripcion}:`);
      console.log(`  Status: ${res.statusCode}`);
      console.log(`  Content-Type: ${contentType}`);
      
      if (res.statusCode === 200) {
        console.log(`  ✅ OK`);
      } else {
        console.log(`  ❌ Error`);
      }
      
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (error) => {
      console.log(`${descripcion}:`);
      console.log(`  ❌ Error: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log(`${descripcion}:`);
      console.log(`  ❌ Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  const baseURL = process.argv[2];
  
  if (!baseURL) {
    console.log('❌ Uso: node verificar-despliegue.js <URL_BASE>');
    console.log('   Ejemplo: node verificar-despliegue.js https://tu-app.vercel.app');
    process.exit(1);
  }

  console.log(`🔍 Verificando despliegue en: ${baseURL}\n`);

  const tests = [
    { url: `${baseURL}/styles.css`, desc: 'CSS Principal' },
    { url: `${baseURL}/login.html`, desc: 'Página de Login' },
    { url: `${baseURL}/login.js`, desc: 'JavaScript de Login' },
    { url: `${baseURL}/`, desc: 'Página Principal' },
    { url: `${baseURL}/api/health`, desc: 'API Health Check' }
  ];

  let allPassed = true;

  for (const test of tests) {
    const passed = await verificarURL(test.url, test.desc);
    if (!passed) allPassed = false;
    console.log('');
  }

  console.log('📊 Resumen:');
  if (allPassed) {
    console.log('✅ Todos los tests pasaron - Despliegue exitoso');
  } else {
    console.log('❌ Algunos tests fallaron - Revisar configuración');
  }

  console.log('\n💡 Para probar el login:');
  console.log(`1. Ve a ${baseURL}/login.html`);
  console.log('2. Ingresa un email de usuario existente');
  console.log('3. Revisa los logs de Vercel para el token (modo demo)');
}

main().catch(console.error);