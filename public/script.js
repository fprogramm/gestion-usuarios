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
    await cargarRoles();
    await cargarUsuarios();
}

// Cerrar modal
document.querySelector('.close').addEventListener('click', cerrarModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
});

// Cargar roles para el select
async function cargarRoles() {
    try {
        const response = await fetch('/api/roles');
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
        const response = await fetch('/api/usuarios');
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
        const response = await fetch(url);
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
            <td class="checkbox-cell">
                <input type="checkbox" class="row-checkbox" value="${usuario.id}">
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="verUsuario(${usuario.id})" title="Ver">👁️</button>
                    <button class="btn-action btn-edit" onclick="editarUsuario(${usuario.id})" title="Editar">✏️</button>
                    <button class="btn-action btn-delete" onclick="eliminarUsuario(${usuario.id})" title="Eliminar">🗑️</button>
                </div>
            </td>
            <td>${usuario.id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.apellido}</td>
            <td>${usuario.email}</td>
            <td>${rolNombre}</td>
            <td>
                <span class="status-indicator ${estadoClase}"></span>
                ${estadoTexto}
            </td>
            <td>${fechaActualizacion}</td>
            <td>
                <button class="btn-action btn-view" onclick="verUsuario(${usuario.id})">Ver</button>
            </td>
        `;
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
        
        // Cambiar texto de ayuda para contraseña en edición
        const passwordHelp = document.querySelector('.form-help');
        if (passwordHelp) {
            passwordHelp.textContent = 'Dejar vacío para mantener la contraseña actual';
        }
    } else {
        formUsuario.reset();
        document.getElementById('activo').checked = true;
        
        // Cambiar texto de ayuda para contraseña en creación
        const passwordHelp = document.querySelector('.form-help');
        if (passwordHelp) {
            passwordHelp.textContent = 'Mínimo 6 caracteres';
        }
    }
    
    modal.style.display = 'block';
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
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
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
        const response = await fetch(`/api/usuarios/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            cargarUsuarios();
            alert('Usuario eliminado correctamente');
        } else {
            throw new Error('Error al eliminar usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el usuario');
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
        const response = await fetch('/api/usuarios', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
        });
        
        if (response.ok) {
            cargarUsuarios();
            selectAll.checked = false;
            alert('Usuarios eliminados correctamente');
        } else {
            throw new Error('Error al eliminar usuarios');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar los usuarios seleccionados');
    }
}