// Servicio de email demo para testing sin configuración SMTP real
class EmailServiceDemo {
  constructor() {
    console.log('📧 EmailServiceDemo inicializado - Modo demostración');
  }

  async enviarTokenLogin(email, token, nombre) {
    // Simular envío de email
    console.log('\n📧 ═══════════════════════════════════════════════════════════════');
    console.log('📧 EMAIL SIMULADO - TOKEN DE ACCESO');
    console.log('📧 ═══════════════════════════════════════════════════════════════');
    console.log(`📧 Para: ${email}`);
    console.log(`📧 Nombre: ${nombre}`);
    console.log(`📧 Token: ${token}`);
    console.log('📧 ═══════════════════════════════════════════════════════════════');
    console.log('📧 En producción, este email se enviaría automáticamente');
    console.log('📧 ═══════════════════════════════════════════════════════════════\n');

    // Simular delay de envío
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { 
      success: true, 
      message: 'Email simulado enviado correctamente (modo demo)' 
    };
  }

  async verificarConexion() {
    console.log('📧 Verificando conexión de email (modo demo)...');
    return { 
      success: true, 
      message: 'Conexión de email verificada (modo demo)' 
    };
  }
}

module.exports = new EmailServiceDemo();