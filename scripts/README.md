# 🌱 Scripts de Configuración Inicial

Este directorio contiene scripts para configurar y poblar la base de datos del sistema de gestión de usuarios.

## 📋 Scripts Disponibles

### 1. `seed.js` - Seed Automático
Crea automáticamente un usuario administrador con configuración predefinida.

```bash
npm run seed
```

**Configuración por defecto:**
- **Nombre:** Administrador Sistema
- **Email:** admin@sistema.com
- **Contraseña:** Admin123456!
- **Rol:** Administrador

### 2. `setup-interactive.js` - Configuración Interactiva
Script interactivo que te permite personalizar completamente el usuario administrador.

```bash
npm run setup:interactive
```

**Características:**
- ✅ Configuración personalizada paso a paso
- ✅ Validación de email y contraseña en tiempo real
- ✅ Selección de rol interactiva
- ✅ Verificación de datos antes de crear
- ✅ Estadísticas del sistema

### 3. `crear-admin.js` - Admin Rápido
Crea rápidamente un usuario administrador básico.

```bash
npm run seed:admin
```

### 4. `setup-production.js` - Configuración de Producción
Script para configurar el primer usuario en producción.

```bash
npm run setup
```

## 🚀 Uso Recomendado

### Para Desarrollo Local:
```bash
# Opción 1: Configuración interactiva (recomendado)
npm run setup:interactive

# Opción 2: Seed automático rápido
npm run seed
```

### Para Producción:
```bash
# Configuración interactiva con validaciones completas
npm run setup:interactive
```

## ⚙️ Requisitos Previos

1. **Base de datos configurada** - Ejecuta el SQL de `database/schema.sql` en Supabase
2. **Variables de entorno** - Configura `SUPABASE_URL` y `SUPABASE_ANON_KEY`
3. **Dependencias instaladas** - Ejecuta `npm install`

## 🔐 Validaciones de Seguridad

### Contraseña Segura (setup-interactive.js):
- ✅ Mínimo 8 caracteres
- ✅ Al menos una mayúscula
- ✅ Al menos una minúscula  
- ✅ Al menos un número
- ✅ Al menos un carácter especial (!@#$%^&*)

### Email:
- ✅ Formato válido
- ✅ Verificación de unicidad
- ✅ Normalización automática

## 📊 Funcionalidades Adicionales

### Verificaciones Automáticas:
- 🔍 Conexión a Supabase
- 📋 Existencia de roles
- 👤 Usuarios administradores existentes
- 📊 Estadísticas del sistema

### Creación de Roles:
Si no existen roles en la base de datos, se crean automáticamente:
- **Administrador** - Acceso completo al sistema
- **Editor** - Puede crear y editar contenido
- **Usuario** - Acceso básico de solo lectura
- **Moderador** - Puede moderar contenido y usuarios

## 🛡️ Seguridad

- 🔐 Contraseñas encriptadas con bcrypt (salt rounds: 12)
- ✅ Email pre-verificado para administradores
- 🚫 Prevención de emails duplicados
- 📝 Logs detallados de todas las operaciones

## 🐛 Solución de Problemas

### Error de Conexión a Supabase:
```bash
❌ Error de conexión a Supabase
```
**Solución:** Verifica las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY` en tu archivo `.env`

### Email ya existe:
```bash
⚠️ Ya existe un usuario con el email: admin@sistema.com
```
**Solución:** Cambia el email en la configuración o usa el script interactivo

### Error de roles:
```bash
❌ No se encontró el rol de Administrador
```
**Solución:** El script creará automáticamente los roles faltantes

## 📝 Ejemplos de Uso

### Crear Admin Personalizado:
```bash
npm run setup:interactive

# Seguir las instrucciones en pantalla:
# 📝 Nombre: Juan
# 📝 Apellido: Pérez  
# 📧 Email: juan.perez@empresa.com
# 🔐 Contraseña: MiPassword123!
# 🛡️ Selecciona el rol (1-4) [1 para Administrador]: 1
```

### Seed Rápido para Testing:
```bash
npm run seed

# Crea automáticamente:
# Email: admin@sistema.com
# Contraseña: Admin123456!
```

## 🔄 Después de Ejecutar

1. **Guarda las credenciales** mostradas en la consola
2. **Configura las variables de email** en Vercel para autenticación
3. **Haz login** en el sistema con las credenciales creadas
4. **Cambia la contraseña** después del primer login
5. **Crea usuarios adicionales** según sea necesario

## 📞 Soporte

Si encuentras problemas con los scripts:

1. Verifica que todas las dependencias estén instaladas
2. Confirma que la base de datos esté configurada correctamente
3. Revisa los logs de error para más detalles
4. Asegúrate de que las variables de entorno estén configuradas

---

**¡Listo para crear tu primer usuario administrador! 🚀**