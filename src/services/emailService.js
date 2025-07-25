const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.demoMode = false;
    
    // Verificar si las credenciales están configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
        process.env.EMAIL_PASS === 'tu_app_password_de_gmail') {
      console.log('⚠️  Credenciales de email no configuradas, usando modo demo');
      this.demoMode = true;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } catch (error) {
      console.log('⚠️  Error configurando transporter, usando modo demo:', error.message);
      this.demoMode = true;
    }
  }

  async enviarTokenLogin(email, token, nombre) {
    // Modo demo - mostrar token en consola
    if (this.demoMode) {
      console.log('\n📧 ═══════════════════════════════════════════════════════════════');
      console.log('📧 EMAIL SIMULADO - TOKEN DE ACCESO');
      console.log('📧 ═══════════════════════════════════════════════════════════════');
      console.log(`📧 Para: ${email}`);
      console.log(`📧 Nombre: ${nombre}`);
      console.log(`📧 Token: ${token}`);
      console.log('📧 ═══════════════════════════════════════════════════════════════');
      console.log('📧 COPIA ESTE TOKEN PARA HACER LOGIN');
      console.log('📧 ═══════════════════════════════════════════════════════════════\n');
      
      return { 
        success: true, 
        message: 'Token generado correctamente (modo demo - revisa la consola del servidor)' 
      };
    }

    // Modo real - enviar email
    const mailOptions = {
      from: `"Sistema de Gestión" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Token de Acceso - Sistema de Gestión de Usuarios',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .token-box { background-color: #f8f9fa; border: 2px dashed #6c757d; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .token { font-size: 24px; font-weight: bold; color: #495057; letter-spacing: 2px; font-family: monospace; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; }
            .btn { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Token de Acceso</h1>
              <p>Sistema de Gestión de Usuarios</p>
            </div>
            
            <div class="content">
              <h2>Hola ${nombre},</h2>
              <p>Has solicitado acceso al sistema de gestión de usuarios. Utiliza el siguiente token para iniciar sesión:</p>
              
              <div class="token-box">
                <div class="token">${token}</div>
                <p style="margin-top: 10px; color: #6c757d;">Copia este código y pégalo en la página de login</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Este token es válido por <strong>15 minutos</strong></li>
                  <li>Solo puede ser usado una vez</li>
                  <li>No compartas este código con nadie</li>
                  <li>Si no solicitaste este acceso, ignora este email</li>
                </ul>
              </div>
              
              <p>Si tienes problemas para acceder, contacta al administrador del sistema.</p>
            </div>
            
            <div class="footer">
              <p>Este es un email automático, no responder.</p>
              <p>Sistema de Gestión de Usuarios - ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Email enviado correctamente' };
    } catch (error) {
      console.error('Error enviando email:', error);
      return { success: false, message: 'Error al enviar email', error: error.message };
    }
  }

  async verificarConexion() {
    if (this.demoMode) {
      return { 
        success: true, 
        message: 'Conexión de email verificada (modo demo)' 
      };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Conexión de email verificada' };
    } catch (error) {
      console.error('Error verificando conexión de email:', error);
      return { success: false, message: 'Error en conexión de email', error: error.message };
    }
  }
}

module.exports = new EmailService();