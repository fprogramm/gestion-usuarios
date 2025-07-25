let usuarios = [];
let roles = [];
let usuarioEditando = null;

// Elementos del DOM
const usuariosBody = document.getElementById('usuariosBody');
const searchInput = document.getElementById('searchInput');
const resultCount = document.getElementById('resultCount');
const modal = document.getElementById('modalUsuario');
const modalTitle = document.getElementById('modalTitle');
const formUsuario = document.getElementById('formUsuario');
const btnAgregar = document.getElementById('btnAgregar');
const btnBuscar = document.getElementById('btnBuscar');
const btnEliminarSeleccionados = document.getElementById('btnEliminarSeleccionados');
const selectAll = document.getElementById('selectAll');

// Event listeners
document.addEventListener('DOMContentLoaded', inicializar);
btnAgregar.addEventListener('click', () => abrirModal());
btnBuscar.addEventListener('click', buscarUsuarios);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') buscarUsuarios();
});
formUsuario.addEventListener('submit', guardarUsuario);
btnEliminarSeleccionados.addEventListener('click', eliminarSeleccionados);
selectAll.addEventListener('change', seleccionarTodos);

// Inicialización
async function inicializar() {
    if (!await verificarAutenticacion()) {
        window.location.href = '/login.html';
        return;
    }
    
    mostrarInfoUsuario();
    await cargarRoles();
    await cargarUsuarios();
}

// Verificar autenticación
async function verificarAutenticacion() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
        const response = await fetch('/api/auth/estado', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            return true;
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('usuario');
            return false;
        }
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');
        return false;
    }
}

// Mostrar información del usuario logueado
function mostrarInfoUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    // Crear barra de usuario
    const header = document.querySelector('header');
    const userBar = document.createElement('div');
    userBar.className = 'flex justify-between items-center mt-4 p-4 bg-gray-800 rounded-lg';
    userBar.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span class="text-white font-semibold">${usuario.nombre?.charAt(0) || 'U'}</span>
            </div>
            <div>
                <p class="text-white font-medium">${usuario.nombre} ${usuario.apellido}</p>
                <p class="text-gray-400 text-sm">${usuario.rol} • ${usuario.email}</p>
            </div>
        </div>
        <button id="btnCerrarSesion" class="btn btn-secondary text-sm">
            🚪 Cerrar Sesión
        </button>
    `;
    
    header.appendChild(userBar);
    
    // Event listener para cerrar sesión
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
}

// Cerrar sesión
async function cerrarSesion() {
    const token = localStorage.getItem('authToken');
    
    try {
        await fetch('/api/auth/cerrar-sesion', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Error cerrando sesión:', error);
    } finally {
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');
        window.location.href = '/login.html';
    }
}

// Función helper para hacer requests autenticadas
async function fetchAutenticado(url, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    const response = await fetch(url, mergedOptions);
    
    // Si el token expiró, redirigir al login
    if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');
        window.location.href = '/login.html';
        return;
    }
    
    return response;
}

// Cerrar modal
document.querySelector('.close').addEventListener('click', cerrarModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
});

// Cargar roles para el select
async function cargarRoles() {
    try {
        const response = await fetchAutenticado('/api/roles');
        if (!response) return;
        roles = await response.json();
        llenarSelectRoles();
    } catch (error) {
        console.error('Error al cargar roles:', error);
        alert('Error al cargar los roles');
    }
}

function llenarSelectRoles() {
    const selectRol = document.getElementById('rol_id');
    selectRol.innerHTML = '<option value="">Seleccionar rol...</option>';
    
    roles.forEach(rol => {
        const option = document.createElement('option');
        option.value = rol.id;
        option.textContent = rol.nombre;
        selectRol.appendChild(option);
    });
}

// Funciones principales
async function cargarUsuarios() {
    try {
        const response = await fetchAutenticado('/api/usuarios');
        if (!response) return;
        usuarios = await response.json();
        renderizarTabla();
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        alert('Error al cargar los usuarios');
    }
}

async function buscarUsuarios() {
    try {
        const search = searchInput.value.trim();
        const url = search ? `/api/usuarios?search=${encodeURIComponent(search)}` : '/api/usuarios';
        const response = await fetchAutenticado(url);
        if (!response) return;
        usuarios = await response.json();
        renderizarTabla();
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        alert('Error al buscar usuarios');
    }
}

function renderizarTabla() {
    usuariosBody.innerHTML = '';
    resultCount.textContent = usuarios.length;
    
    usuarios.forEach(usuario => {
        const row = document.createElement('tr');
        const fechaActualizacion = new Date(usuario.updated_at || usuario.created_at).toLocaleDateString('es-ES');
        const rolNombre = usuario.roles ? usuario.roles.nombre : 'Sin rol';
        const estadoTexto = usuario.activo ? 'Activo' : 'Inactivo';
        const estadoClase = usuario.activo ? 'status-active' : 'status-inactive';
        
        row.innerHTML = `
            <td class="px-4 py-3">
                <input type="checkbox" class="row-checkbox rounded bg-gray-600 border-gray-500" value="${usuario.id}">
            </td>
            <td class="px-4 py-3">
                <div class="flex gap-1">
                    <button class="btn-action btn-view" onclick="verUsuario(${usuario.id})" title="Ver">👁️</button>
                    <button class="btn-action btn-edit" onclick="editarUsuario(${usuario.id})" title="Editar">✏️</button>
                    <button class="btn-action btn-delete" onclick="eliminarUsuario(${usuario.id})" title="Eliminar">🗑️</button>
                </div>
            </td>
            <td class="px-4 py-3 text-gray-300">${usuario.id}</td>
            <td class="px-4 py-3 font-medium">${usuario.nombre}</td>
            <td class="px-4 py-3 font-medium">${usuario.apellido}</td>
            <td class="px-4 py-3 text-blue-400">${usuario.email}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs rounded-full bg-purple-600 text-white">${rolNombre}</span>
            </td>
            <td class="px-4 py-3">
                <div class="flex items-center">
                    <span class="status-indicator ${estadoClase}"></span>
                    <span class="text-sm">${estadoTexto}</span>
                </div>
            </td>
            <td class="px-4 py-3 text-gray-400 text-sm">${fechaActualizacion}</td>
            <td class="px-4 py-3">
                <button class="btn-action btn-view text-xs" onclick="verUsuario(${usuario.id})">Ver</button>
            </td>
        `;
        
        // Agregar hover effect a la fila
        row.className = "hover:bg-gray-750 transition-colors duration-200";
        usuariosBody.appendChild(row);
    });
    
    // Actualizar visibilidad del botón de eliminar seleccionados
    actualizarBotonEliminar();
    
    // Event listeners para checkboxes
    document.querySelectorAll('.row-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', actualizarBotonEliminar);
    });
}

function abrirModal(usuario = null) {
    usuarioEditando = usuario;
    modalTitle.textContent = usuario ? 'Editar Usuario' : 'Agregar Usuario';
    
    if (usuario) {
        document.getElementById('nombre').value = usuario.nombre;
        document.getElementById('apellido').value = usuario.apellido;
        document.getElementById('email').value = usuario.email;
        document.getElementById('password').value = '';
        document.getElementById('rol_id').value = usuario.rol_id || '';
        document.getElementById('activo').checked = usuario.activo !== false;
    } else {
        formUsuario.reset();
        document.getElementById('activo').checked = true;
    }
    
    modal.style.display = 'flex';
}

function cerrarModal() {
    modal.style.display = 'none';
    usuarioEditando = null;
    formUsuario.reset();
}

async function guardarUsuario(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rol_id = document.getElementById('rol_id').value;
    const activo = document.getElementById('activo').checked;
    
    // Validaciones
    if (!nombre || !apellido || !email || !rol_id) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
    }
    
    if (!usuarioEditando && !password) {
        alert('La contraseña es obligatoria para nuevos usuarios');
        return;
    }
    
    if (password && password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, ingresa un email válido');
        return;
    }
    
    try {
        const url = usuarioEditando ? `/api/usuarios/${usuarioEditando.id}` : '/api/usuarios';
        const method = usuarioEditando ? 'PUT' : 'POST';
        
        const body = {
            nombre,
            apellido,
            email,
            rol_id: parseInt(rol_id),
            activo
        };
        
        // Solo incluir contraseña si se proporciona
        if (password && password.trim() !== '') {
            body.password = password;
        }
        
        const response = await fetchAutenticado(url, {
            method,
            body: JSON.stringify(body)
        });
        
        if (response.ok) {
            cerrarModal();
            cargarUsuarios();
            alert(usuarioEditando ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al guardar usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}

async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        return;
    }
    
    try {
        const response = await fetchAutenticado(`/api/usuarios/${id}`, {
            method: 'DELETE'
        });
        
        if (!response) return;
        
        if (response.ok) {
            cargarUsuarios();
            alert('Usuario eliminado correctamente');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al eliminar usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el usuario: ' + error.message);
    }
}

function editarUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
        abrirModal(usuario);
    }
}

function verUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
        const rolNombre = usuario.roles ? usuario.roles.nombre : 'Sin rol';
        const estadoTexto = usuario.activo ? 'Activo' : 'Inactivo';
        const fechaCreacion = new Date(usuario.created_at).toLocaleString('es-ES');
        const fechaActualizacion = new Date(usuario.updated_at || usuario.created_at).toLocaleString('es-ES');
        
        alert(`Información del Usuario:

ID: ${usuario.id}
Nombre: ${usuario.nombre}
Apellido: ${usuario.apellido}
Email: ${usuario.email}
Rol: ${rolNombre}
Estado: ${estadoTexto}
Fecha de creación: ${fechaCreacion}
Última actualización: ${fechaActualizacion}`);
    }
}

function seleccionarTodos() {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
    actualizarBotonEliminar();
}

function actualizarBotonEliminar() {
    const checkboxesSeleccionados = document.querySelectorAll('.row-checkbox:checked');
    btnEliminarSeleccionados.style.display = checkboxesSeleccionados.length > 0 ? 'block' : 'none';
}

async function eliminarSeleccionados() {
    const checkboxesSeleccionados = document.querySelectorAll('.row-checkbox:checked');
    const ids = Array.from(checkboxesSeleccionados).map(cb => parseInt(cb.value));
    
    if (ids.length === 0) {
        alert('No hay usuarios seleccionados');
        return;
    }
    
    if (!confirm(`¿Estás seguro de que quieres eliminar ${ids.length} usuario(s)?`)) {
        return;
    }
    
    try {
        const response = await fetchAutenticado('/api/usuarios', {
            method: 'DELETE',
            body: JSON.stringify({ ids })
        });
        
        if (!response) return;
        
        if (response.ok) {
            cargarUsuarios();
            selectAll.checked = false;
            alert('Usuarios eliminados correctamente');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al eliminar usuarios');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar los usuarios seleccionados: ' + error.message);
    }
}