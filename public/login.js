// Variables globales
let emailActual = '';
let tiempoExpiracion = null;

// Elementos del DOM
const formSolicitarToken = document.getElementById('formSolicitarToken');
const formVerificarToken = document.getElementById('formVerificarToken');
const solicitudTokenForm = document.getElementById('solicitudTokenForm');
const verificacionTokenForm = document.getElementById('verificacionTokenForm');
const btnSolicitarToken = document.getElementById('btnSolicitarToken');
const btnVerificarToken = document.getElementById('btnVerificarToken');
const btnVolverEmail = document.getElementById('btnVolverEmail');
const emailInput = document.getElementById('email');
const tokenInput = document.getElementById('token');
const emailEnviado = document.getElementById('emailEnviado');
const mensajes = document.getElementById('mensajes');
const loading = document.getElementById('loading');
const tiempoExpiracionSpan = document.getElementById('tiempoExpiracion');

// Event listeners
document.addEventListener('DOMContentLoaded', verificarSesionExistente);
solicitudTokenForm.addEventListener('submit', solicitarToken);
verificacionTokenForm.addEventListener('submit', verificarToken);
btnVolverEmail.addEventListener('click', volverAEmail);
tokenInput.addEventListener('input', formatearToken);

// Verificar si ya hay una sesión activa
async function verificarSesionExistente() {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const response = await fetch('/api/auth/estado', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                // Ya está autenticado, redirigir al dashboard
                window.location.href = '/';
                return;
            }
        } catch (error) {
            // Token inválido, continuar con login
            localStorage.removeItem('authToken');
        }
    }
}

// Solicitar token por email
async function solicitarToken(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    if (!email) {
        mostrarMensaje('Por favor ingresa tu email', 'error');
        return;
    }

    mostrarLoading(true);
    btnSolicitarToken.disabled = true;
    btnSolicitarToken.textContent = 'Enviando...';

    try {
        const response = await fetch('/api/auth/solicitar-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            emailActual = email;
            emailEnviado.textContent = email;
            mostrarFormularioToken();
            mostrarMensaje('Token enviado correctamente. Revisa tu email.', 'success');
            iniciarTemporizador();
        } else {
            mostrarMensaje(data.error || 'Error al enviar token', 'error');
        }

    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión. Intenta de nuevo.', 'error');
    } finally {
        mostrarLoading(false);
        btnSolicitarToken.disabled = false;
        btnSolicitarToken.textContent = '📧 Enviar Token por Email';
    }
}

// Verificar token y hacer login
async function verificarToken(e) {
    e.preventDefault();
    
    const token = tokenInput.value.trim();
    if (!token || token.length !== 6) {
        mostrarMensaje('Por favor ingresa el código de 6 dígitos', 'error');
        return;
    }

    mostrarLoading(true);
    btnVerificarToken.disabled = true;
    btnVerificarToken.textContent = 'Verificando...';

    try {
        const response = await fetch('/api/auth/verificar-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: emailActual, 
                token 
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar token JWT
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            mostrarMensaje('¡Login exitoso! Redirigiendo...', 'success');
            
            // Redirigir después de un breve delay
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);

        } else {
            mostrarMensaje(data.error || 'Token inválido o expirado', 'error');
            tokenInput.value = '';
            tokenInput.focus();
        }

    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión. Intenta de nuevo.', 'error');
    } finally {
        mostrarLoading(false);
        btnVerificarToken.disabled = false;
        btnVerificarToken.textContent = '🔓 Verificar y Acceder';
    }
}

// Mostrar formulario de token
function mostrarFormularioToken() {
    formSolicitarToken.style.display = 'none';
    formVerificarToken.style.display = 'block';
    tokenInput.focus();
}

// Volver al formulario de email
function volverAEmail() {
    formVerificarToken.style.display = 'none';
    formSolicitarToken.style.display = 'block';
    emailInput.focus();
    limpiarTemporizador();
    limpiarMensajes();
}

// Formatear input del token (solo números)
function formatearToken(e) {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length > 6) value = value.substring(0, 6);
    e.target.value = value;
}

// Mostrar/ocultar loading
function mostrarLoading(mostrar) {
    loading.style.display = mostrar ? 'flex' : 'none';
}

// Mostrar mensajes
function mostrarMensaje(mensaje, tipo) {
    limpiarMensajes();
    
    const div = document.createElement('div');
    div.className = `p-4 rounded-lg ${
        tipo === 'success' 
            ? 'bg-green-900 border border-green-600 text-green-300' 
            : 'bg-red-900 border border-red-600 text-red-300'
    }`;
    
    div.innerHTML = `
        <div class="flex items-center">
            <span class="mr-2">${tipo === 'success' ? '✅' : '❌'}</span>
            <span>${mensaje}</span>
        </div>
    `;
    
    mensajes.appendChild(div);
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        if (div.parentNode) {
            div.remove();
        }
    }, 5000);
}

// Limpiar mensajes
function limpiarMensajes() {
    mensajes.innerHTML = '';
}

// Iniciar temporizador de expiración
function iniciarTemporizador() {
    tiempoExpiracion = Date.now() + (15 * 60 * 1000); // 15 minutos
    actualizarTemporizador();
    
    const interval = setInterval(() => {
        if (actualizarTemporizador()) {
            clearInterval(interval);
        }
    }, 1000);
}

// Actualizar display del temporizador
function actualizarTemporizador() {
    if (!tiempoExpiracion) return true;
    
    const ahora = Date.now();
    const tiempoRestante = tiempoExpiracion - ahora;
    
    if (tiempoRestante <= 0) {
        tiempoExpiracionSpan.textContent = 'expirado';
        tiempoExpiracionSpan.className = 'font-medium text-red-400';
        mostrarMensaje('El token ha expirado. Solicita uno nuevo.', 'error');
        return true; // Detener temporizador
    }
    
    const minutos = Math.floor(tiempoRestante / 60000);
    const segundos = Math.floor((tiempoRestante % 60000) / 1000);
    
    tiempoExpiracionSpan.textContent = `${minutos}:${segundos.toString().padStart(2, '0')}`;
    tiempoExpiracionSpan.className = tiempoRestante < 60000 
        ? 'font-medium text-red-400' 
        : 'font-medium text-white';
    
    return false;
}

// Limpiar temporizador
function limpiarTemporizador() {
    tiempoExpiracion = null;
    tiempoExpiracionSpan.textContent = '15 minutos';
    tiempoExpiracionSpan.className = 'font-medium';
}

// Manejar tecla Enter en el campo de token
tokenInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && tokenInput.value.length === 6) {
        verificarToken(e);
    }
});