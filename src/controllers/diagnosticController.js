const emailService = require('../services/emailService');

const diagnosticController = {
  // Endpoint para verificar configuración de email (solo admin)
  async verificarEmail(req, res) {
    try {
      console.log('🔍 Iniciando diagnóstico de email...');
      
      // Verificar variables de entorno
      const config = {
        EMAIL_HOST: process.env.EMAIL_HOST || 'No configurado',
        EMAIL_PORT: process.env.EMAIL_PORT || 'No configurado',
        EMAIL_USER: process.env.EMAIL_USER || 'No configurado',
        EMAIL_PASS: process.env.EMAIL_PASS ? '[CONFIGURADO]' : 'No configurado',
        NODE_ENV: process.env.NODE_ENV || 'development'
      };

      console.log('📋 Variables de entorno:', config);

      // Verificar conexión
      const connectionResult = await emailService.verificarConexion();
      console.log('🔗 Resultado de conexión:', connectionResult);

      // Intentar envío de prueba
      const testEmail = req.body.email || req.usuario.email;
      const testResult = await emailService.enviarTokenLogin(
        testEmail, 
        '123456', 
        'Test Usuario'
      );
      console.log('📤 Resultado de envío:', testResult);

      res.json({
        success: true,
        config: config,
        connection: connectionResult,
        testSend: testResult,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  },

  // Endpoint para verificar logs recientes
  async verificarLogs(req, res) {
    try {
      // En producción, esto mostraría información útil para debugging
      const info = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        platform: process.platform,
        nodeVersion: process.version,
        emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
        databaseConnected: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
      };

      console.log('📊 Info del sistema:', info);

      res.json({
        success: true,
        info: info
      });

    } catch (error) {
      console.error('❌ Error obteniendo logs:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = diagnosticController;