# 🔧 Solución de Problemas en Producción

## 📧 Problema: Emails no se envían en Vercel

### ✅ **Verificación Local (Completada)**
- ✅ Variables de entorno configuradas
- ✅ App Password de Gmail funcionando
- ✅ Conexión SMTP exitosa
- ✅ Envío de email exitoso

### 🚀 **Configuración en Vercel**

#### Paso 1: Variables de Entorno
En tu proyecto de Vercel → Settings → Environment Variables:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=soporte.liborina@gmail.com
EMAIL_PASS=cynh auha wrjk uhgc
```

#### Paso 2: Redeploy
Después de agregar las variables, redeploy el proyecto.

### 🧪 **Herramientas de Diagnóstico**

#### 1. Página de Diagnóstico Web
```
https://tu-app.vercel.app/diagnostic.html
```
- Requiere login como administrador
- Prueba configuración de email en tiempo real
- Muestra logs detallados

#### 2. Script de Línea de Comandos
```bash
npm run test:production https://tu-app.vercel.app soporte.liborina@gmail.com
```

#### 3. Endpoints de API para Diagnóstico
```bash
# Verificar email (requiere auth de admin)
POST /api/diagnostic/email
{
  "email": "soporte.liborina@gmail.com"
}

# Verificar logs del sistema
GET /api/diagnostic/logs
```

### 🔍 **Verificar Logs de Vercel**

1. Ve a tu proyecto en Vercel
2. Functions → View Function Logs
3. Filtra por errores o busca "📧"
4. Los logs mostrarán:
   - Variables de entorno detectadas
   - Intentos de conexión SMTP
   - Resultados de envío de email

### 🚨 **Problemas Comunes**

#### Error: "Invalid login" en Vercel
- **Causa**: App Password no configurada en Vercel
- **Solución**: Verificar que `EMAIL_PASS` esté configurada correctamente

#### Error: "Connection timeout"
- **Causa**: Vercel puede tener restricciones de red
- **Solución**: Probar con puerto 465 y `secure: true`

#### Emails no llegan pero no hay errores
- **Causa**: Filtros de spam o configuración de Gmail
- **Solución**: Revisar carpeta de spam, verificar configuración de Gmail

### 🔧 **Configuración Alternativa para Vercel**

Si Gmail no funciona en Vercel, prueba esta configuración:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=soporte.liborina@gmail.com
EMAIL_PASS=cynh auha wrjk uhgc
```

Y actualiza el servicio de email:

```javascript
secure: process.env.EMAIL_PORT === '465', // true para 465
```

### 📊 **Monitoreo Continuo**

#### Logs a Buscar en Vercel:
```
🔍 Solicitando token para: email@example.com
✅ Usuario encontrado: Nombre Apellido
📧 Enviando token por email...
📧 Resultado del envío: { success: true, message: "Email enviado correctamente" }
✅ Token enviado exitosamente
```

#### Logs de Error:
```
❌ Usuario no encontrado: email@example.com
❌ Error enviando email: Invalid login
❌ Error enviando email: Connection timeout
```

### 🎯 **Checklist de Verificación**

- [ ] Variables de entorno configuradas en Vercel
- [ ] Proyecto redesplegado después de configurar variables
- [ ] App Password de Gmail válida (16 caracteres)
- [ ] Usuario existe y está activo en la base de datos
- [ ] Logs de Vercel revisados
- [ ] Página de diagnóstico probada
- [ ] Carpeta de spam revisada

### 🆘 **Si Nada Funciona**

1. **Modo Demo Temporal**: Comenta las variables de email en Vercel para usar modo demo
2. **Servicio Alternativo**: Considera usar SendGrid, Mailgun o Amazon SES
3. **Soporte**: Revisa los logs detallados en la página de diagnóstico

### 📞 **Contacto de Soporte**

Si el problema persiste:
1. Captura de pantalla de variables en Vercel
2. Logs completos de Vercel Functions
3. Resultado de la página de diagnóstico
4. Resultado del script de test de producción