# 🚀 Despliegue en Vercel

Esta guía te ayudará a desplegar tu sistema de gestión de usuarios en Vercel.

## 📋 Prerrequisitos

1. **Cuenta en Vercel** - [vercel.com](https://vercel.com)
2. **Base de datos Supabase** - [supabase.com](https://supabase.com)
3. **Cuenta de email** (Gmail recomendado para producción)

## 🔧 Configuración de Variables de Entorno

### Variables Requeridas

En tu proyecto de Vercel, ve a **Settings > Environment Variables** y agrega:

```bash
# Base de datos (Supabase)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

# JWT (Genera una clave segura de al menos 32 caracteres)
JWT_SECRET=tu_clave_secreta_jwt_muy_segura_de_al_menos_32_caracteres
JWT_EXPIRES_IN=24h

# Token de login
TOKEN_EXPIRES_IN=15m
```

### Variables de Email (Opcionales)

Para envío real de emails (recomendado para producción):

```bash
# Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
```

> **Nota**: Si no configuras las variables de email, el sistema funcionará en modo demo mostrando los tokens en los logs de Vercel.

## 🚀 Pasos de Despliegue

### 1. Conectar Repositorio

1. Ve a [vercel.com](https://vercel.com) y haz login
2. Click en "New Project"
3. Conecta tu repositorio de GitHub/GitLab/Bitbucket
4. Selecciona este proyecto

### 2. Configurar Variables

1. En la página de configuración del proyecto
2. Ve a **Settings > Environment Variables**
3. Agrega todas las variables listadas arriba
4. Asegúrate de marcar todas como disponibles para **Production**, **Preview** y **Development**

### 3. Configurar Base de Datos

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Ejecuta el script SQL del archivo `database/schema.sql`
3. Crea un usuario administrador usando: `npm run seed:admin`

### 4. Desplegar

1. Vercel detectará automáticamente la configuración
2. El build se ejecutará automáticamente
3. Una vez completado, tendrás tu URL de producción

## 🔍 Verificación

### Verificar Configuración Local

```bash
npm run verify:vercel
```

### Verificar en Producción

1. Ve a tu URL de Vercel
2. Intenta hacer login con un email de usuario existente
3. Revisa los logs en Vercel Dashboard > Functions > View Function Logs

## 📧 Configuración de Email

### Gmail App Password

1. Ve a tu cuenta de Google
2. Seguridad > Verificación en 2 pasos (debe estar activada)
3. Contraseñas de aplicaciones
4. Genera una nueva contraseña para "Correo"
5. Usa esta contraseña en `EMAIL_PASS`

### Otros Proveedores

El sistema es compatible con cualquier servidor SMTP. Ajusta las variables:
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`

## 🛠️ Solución de Problemas

### Error: "Token inválido o expirado"

- Verifica que `JWT_SECRET` esté configurado
- Asegúrate de que la base de datos esté accesible

### Error: "Usuario no encontrado"

- Verifica que hayas ejecutado el script de seed
- Confirma que el usuario existe en la tabla `usuarios`

### Emails no se envían

- Revisa los logs de Vercel
- Verifica las credenciales de email
- En modo demo, los tokens aparecen en los logs

### Rate Limiting

- El sistema limita intentos por IP
- En desarrollo local, usa diferentes navegadores o modo incógnito
- En producción, el rate limiting es por IP real

## 📊 Monitoreo

### Logs de Vercel

1. Ve a tu proyecto en Vercel
2. Functions > View Function Logs
3. Filtra por errores o busca tokens en modo demo

### Base de Datos

Monitorea las tablas:
- `auth_tokens` - Tokens generados
- `sesiones` - Sesiones activas
- `usuarios` - Usuarios del sistema

## 🔒 Seguridad

### Recomendaciones

1. **JWT_SECRET**: Usa una clave de al menos 32 caracteres aleatorios
2. **HTTPS**: Vercel proporciona HTTPS automáticamente
3. **Rate Limiting**: Ya configurado para prevenir ataques
4. **Tokens**: Expiran automáticamente en 15 minutos
5. **Sesiones**: Se invalidan al cerrar sesión

### Variables Sensibles

- Nunca commits las variables de entorno al repositorio
- Usa el archivo `.env` solo para desarrollo local
- En producción, usa las variables de entorno de Vercel

## 🆘 Soporte

Si tienes problemas:

1. Ejecuta `npm run verify:vercel` localmente
2. Revisa los logs de Vercel
3. Verifica la configuración de Supabase
4. Confirma que todas las variables estén configuradas

## 📝 Notas Adicionales

- El sistema funciona completamente serverless en Vercel
- Los tokens se almacenan en Supabase, no en memoria
- El rate limiting funciona por IP real de Vercel
- Los logs de modo demo aparecen en Vercel Functions