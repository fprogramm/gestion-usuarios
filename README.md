# Sistema de Gestión de Usuarios con Supabase

Sistema completo de gestión de usuarios con roles, autenticación y interfaz web moderna en español.

## 🚀 Características

- ✅ **CRUD completo de usuarios** (Crear, Leer, Actualizar, Eliminar)
- ✅ **Sistema de roles** con gestión completa
- ✅ **Autenticación segura** con contraseñas encriptadas
- ✅ **Búsqueda avanzada** por nombre, apellido o email
- ✅ **Selección múltiple** y eliminación masiva
- ✅ **Interfaz moderna** con tema oscuro
- ✅ **Validaciones completas** del lado cliente y servidor
- ✅ **Responsive design** para móviles y desktop

## 📁 Estructura del Proyecto

```
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de Supabase
│   ├── controllers/
│   │   ├── usuarioController.js # Controlador de usuarios
│   │   └── rolController.js     # Controlador de roles
│   └── models/
│       ├── Usuario.js           # Modelo de usuario
│       └── Rol.js              # Modelo de rol
├── public/
│   ├── index.html              # Interfaz principal
│   ├── script.js               # JavaScript del frontend
│   └── styles.css              # Estilos CSS
├── database/
│   └── schema.sql              # Script de base de datos
├── server.js                   # Servidor Express
└── package.json               # Dependencias
```

## 🛠️ Instalación

### 1. Clonar y configurar el proyecto

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

### 2. Configurar Supabase

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea una nueva cuenta o inicia sesión
   - Crea un nuevo proyecto

2. **Ejecutar el script SQL:**
   - Ve a la sección "SQL Editor" en tu proyecto de Supabase
   - Copia y pega el contenido de `database/schema.sql`
   - Ejecuta el script

3. **Obtener credenciales:**
   - Ve a Settings > API
   - Copia la URL del proyecto y la clave anónima

### 3. Configurar variables de entorno

Edita el archivo `.env`:

```env
SUPABASE_URL=tu_url_de_supabase_aqui
SUPABASE_ANON_KEY=tu_clave_anonima_aqui
PORT=3000
```

### 4. Ejecutar la aplicación

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

## 📊 Base de Datos

### Tabla `roles`
- `id` (SERIAL PRIMARY KEY)
- `nombre` (VARCHAR(50) UNIQUE)
- `descripcion` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

### Tabla `usuarios`
- `id` (SERIAL PRIMARY KEY)
- `nombre` (VARCHAR(100))
- `apellido` (VARCHAR(100))
- `email` (VARCHAR(255) UNIQUE)
- `password_hash` (VARCHAR(255))
- `rol_id` (INTEGER FK → roles.id)
- `activo` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

### Roles por defecto
- **Administrador**: Acceso completo al sistema
- **Editor**: Puede crear y editar contenido
- **Usuario**: Acceso básico de solo lectura
- **Moderador**: Puede moderar contenido y usuarios

## 🔧 API Endpoints

### Usuarios
- `GET /api/usuarios` - Obtener todos los usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios` - Crear nuevo usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario
- `DELETE /api/usuarios` - Eliminar múltiples usuarios
- `POST /api/auth/login` - Autenticar usuario

### Roles
- `GET /api/roles` - Obtener todos los roles
- `GET /api/roles/:id` - Obtener rol por ID
- `POST /api/roles` - Crear nuevo rol
- `PUT /api/roles/:id` - Actualizar rol
- `DELETE /api/roles/:id` - Eliminar rol

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Validación de email único
- Validaciones del lado cliente y servidor
- Sanitización de datos de entrada
- Manejo seguro de errores

## 🎨 Interfaz de Usuario

- **Tema oscuro moderno**
- **Tabla responsive** con todas las funcionalidades
- **Modal para agregar/editar** usuarios
- **Búsqueda en tiempo real**
- **Selección múltiple** con checkboxes
- **Indicadores de estado** visual
- **Validaciones en tiempo real**

## 📱 Funcionalidades de la Interfaz

1. **Agregar Usuario**: Botón azul "AGREGAR NUEVO"
2. **Buscar**: Campo de búsqueda por apellido con botón
3. **Acciones por fila**: Ver, Editar, Eliminar
4. **Selección múltiple**: Checkbox para eliminar varios usuarios
5. **Estados visuales**: Indicadores de usuario activo/inactivo
6. **Información completa**: Modal con todos los datos del usuario

## 🚀 Próximas Mejoras

- [ ] Autenticación JWT
- [ ] Paginación de resultados
- [ ] Exportar datos a CSV/Excel
- [ ] Filtros avanzados
- [ ] Historial de cambios
- [ ] Notificaciones en tiempo real
- [ ] API REST documentada con Swagger

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.

---

**¡Disfruta gestionando tus usuarios! 🎉**