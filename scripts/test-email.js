#!/usr/bin/env node

/**
 * Script para probar el servicio de email
 */

require('dotenv').config();

async function testEmailService() {
  console.log('📧 Probando servicio de email...\n');

  try {
    // Importar el servicio de email
    const emailService = require('../src/services/emailService');
    
    // Verificar conexión
    console.log('🔍 Verificando conexión...');
    const connectionResult = await emailService.verificarConexion();
    console.log(`Resultado: ${connectionResult.success ? '✅' : '❌'} ${connectionResult.message}`);
    
    if (!connectionResult.success) {
      console.log('Error:', connectionResult.error);
      return;
    }

    // Probar envío de token
    console.log('\n📤 Probando envío de token...');
    const testEmail = process.argv[2] || 'test@example.com';
    const testToken = '123456';
    const testName = 'Usuario de Prueba';

    console.log(`Enviando a: ${testEmail}`);
    console.log(`Token: ${testToken}`);
    
    const sendResult = await emailService.enviarTokenLogin(testEmail, testToken, testName);
    console.log(`Resultado: ${sendResult.success ? '✅' : '❌'} ${sendResult.message}`);
    
    if (!sendResult.success) {
      console.log('Error:', sendResult.error);
    }

  } catch (error) {
    console.error('❌ Error en test:', error.message);
    console.error('Stack:', error.stack);
  }
}

console.log('Variables de email configuradas:');
console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST || 'No configurado'}`);
console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT || 'No configurado'}`);
console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'No configurado'}`);
console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '[CONFIGURADO]' : 'No configurado'}`);
console.log('');

testEmailService();