#!/usr/bin/env node

/**
 * Script para generar CSS con Tailwind
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎨 Generando CSS con Tailwind...\n');

try {
  // Verificar que el archivo de entrada existe
  const inputFile = path.join(__dirname, '../src/input.css');
  if (!fs.existsSync(inputFile)) {
    console.error('❌ Archivo src/input.css no encontrado');
    process.exit(1);
  }

  // Crear directorio public si no existe
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('📁 Directorio public creado');
  }

  // Ejecutar Tailwind
  console.log('⚙️  Ejecutando Tailwind CSS...');
  execSync('npx tailwindcss -i ./src/input.css -o ./public/styles.css --minify', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  // Verificar que el archivo se generó
  const outputFile = path.join(__dirname, '../public/styles.css');
  if (fs.existsSync(outputFile)) {
    const stats = fs.statSync(outputFile);
    console.log(`✅ CSS generado exitosamente (${Math.round(stats.size / 1024)}KB)`);
    
    // Mostrar las primeras líneas para verificar
    const content = fs.readFileSync(outputFile, 'utf8');
    if (content.includes('tailwindcss')) {
      console.log('✅ CSS contiene estilos de Tailwind');
    } else {
      console.log('⚠️  CSS generado pero podría estar vacío');
    }
  } else {
    console.error('❌ Error: archivo CSS no se generó');
    process.exit(1);
  }

  console.log('\n🎉 Build de CSS completado exitosamente');

} catch (error) {
  console.error('❌ Error generando CSS:', error.message);
  process.exit(1);
}