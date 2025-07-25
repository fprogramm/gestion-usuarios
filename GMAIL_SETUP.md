# 📧 Configuración de Gmail para Envío de Emails

## 🚨 Problema Identificado

El error que estás viendo indica que Gmail requiere una **contraseña de aplicación** en lugar de tu contraseña normal:

```
534-5.7.9 Application-specific password required
```

## 🔧 Solución: Configurar App Password de Gmail

### Paso 1: Habilitar Verificación en 2 Pasos

1. Ve a tu [Cuenta de Google](https://myaccount.google.com/)
2. Selecciona **Seguridad** en el panel izquierdo
3. En "Iniciar sesión en Google", selecciona **Verificación en 2 pasos**
4. Sigue las instrucciones para habilitarla (es **obligatorio** para App Passwords)

### Paso 2: Generar App Password

1. Una vez habilitada la verificación en 2 pasos
2. Ve a **Seguridad** > **Verificación en 2 pasos**
3. Desplázate hacia abajo hasta **Contraseñas de aplicaciones**
4. Haz clic en **Contraseñas de aplicaciones**
5. Selecciona **Correo** como aplicación
6. Selecciona **Otro (nombre personalizado)** como dispositivo
7. Escribe "Sistema de Gestión" o similar
8. Haz clic en **Generar**
9. **Copia la contraseña de 16 caracteres** que aparece

### Paso 3: Actualizar Variables de Entorno

Actualiza tu archivo `.env` con la nueva contraseña:

```bash
# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=soporte.liborina@gmail.com
EMAIL_PASS=tu_app_password_de_16_caracteres_aqui
```

**⚠️ IMPORTANTE**: 
- Usa la contraseña de aplicación de 16 caracteres, NO tu contraseña normal
- La contraseña de aplicación no tiene espacios ni guiones

## 🧪 Probar la Configuración

Una vez configurada, prueba el email:

```bash
node scripts/test-email.js tu_email@gmail.com
```

## 🔒 Alternativas de Seguridad

### Opción 1: Usar otro servicio de email
Si no quieres usar Gmail, puedes usar:

- **SendGrid** (recomendado para producción)
- **Mailgun**
- **Amazon SES**
- **Outlook/Hotmail**

### Opción 2: Modo Demo (Desarrollo)
Para desarrollo, puedes usar el modo demo comentando las variables de email:

```bash
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=soporte.liborina@gmail.com
# EMAIL_PASS=tu_app_password
```

Los tokens aparecerán en la consola del servidor.

## 📝 Configuración para Otros Proveedores

### Outlook/Hotmail
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=tu_email@outlook.com
EMAIL_PASS=tu_contraseña
```

### Yahoo
```bash
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=tu_email@yahoo.com
EMAIL_PASS=tu_app_password
```

## 🛠️ Solución de Problemas

### Error: "Invalid login"
- Verifica que la verificación en 2 pasos esté habilitada
- Asegúrate de usar la App Password, no la contraseña normal
- La App Password debe ser de exactamente 16 caracteres

### Error: "Connection timeout"
- Verifica que el puerto 587 no esté bloqueado
- Prueba con puerto 465 y `secure: true`

### Error: "Self signed certificate"
- Agrega `rejectUnauthorized: false` en desarrollo (no recomendado para producción)

## 🚀 Configuración para Producción

Para producción en Vercel, configura las variables de entorno:

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega:
   - `EMAIL_HOST`: `smtp.gmail.com`
   - `EMAIL_PORT`: `587`
   - `EMAIL_USER`: `tu_email@gmail.com`
   - `EMAIL_PASS`: `tu_app_password_de_16_caracteres`

## ✅ Verificación Final

Ejecuta estos comandos para verificar:

```bash
# Verificar configuración
npm run verify:vercel

# Probar email
node scripts/test-email.js

# Probar sistema completo
npm start
```

Una vez configurado correctamente, deberías ver:
- ✅ Conexión de email verificada
- ✅ Email enviado correctamente