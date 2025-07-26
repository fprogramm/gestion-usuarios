#!/usr/bin/env node

/**
 * Script para probar el sistema en producción
 */

const https = require('https');

async function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testProduction() {
  const baseURL = process.argv[2];
  const testEmail = process.argv[3];
  
  if (!baseURL) {
    console.log('❌ Uso: node test-production.js <URL_BASE> [EMAIL_PRUEBA]');
    console.log('   Ejemplo: node test-production.js https://tu-app.vercel.app soporte.liborina@gmail.com');
    process.exit(1);
  }

  console.log(`🧪 Probando sistema en producción: ${baseURL}\n`);

  try {
    // 1. Verificar que la API esté funcionando
    console.log('1️⃣ Verificando API...');
    const healthCheck = await makeRequest(`${baseURL}/api/health`);
    console.log(`   Status: ${healthCheck.status}`);
    console.log(`   Respuesta: ${JSON.stringify(healthCheck.data)}\n`);

    // 2. Probar solicitud de token
    console.log('2️⃣ Probando solicitud de token...');
    const email = testEmail || 'soporte.liborina@gmail.com';
    
    const tokenRequest = await makeRequest(
      `${baseURL}/api/auth/solicitar-token`,
      'POST',
      { email: email }
    );
    
    console.log(`   Status: ${tokenRequest.status}`);
    console.log(`   Respuesta: ${JSON.stringify(tokenRequest.data, null, 2)}\n`);

    if (tokenRequest.status === 200) {
      console.log('✅ Solicitud de token exitosa');
      console.log('💡 Revisa los logs de Vercel para ver el token generado');
    } else {
      console.log('❌ Error en solicitud de token');
      console.log('🔍 Detalles del error:', tokenRequest.data);
    }

    // 3. Verificar CSS
    console.log('3️⃣ Verificando CSS...');
    const cssCheck = await makeRequest(`${baseURL}/styles.css`);
    console.log(`   Status: ${cssCheck.status}`);
    console.log(`   Content-Type: ${cssCheck.headers?.['content-type'] || 'No disponible'}\n`);

  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testProduction();