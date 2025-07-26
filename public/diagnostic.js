// Variables globales
let authToken = localStorage.getItem('authToken');

// Elementos del DOM
const btnTestEmail = document.getElementById('btnTestEmail');
const btnCheckLogs = document.getElementById('btnCheckLogs');
const btnTestLogin = document.getElementById('btnTestLogin');
const testEmailInput = document.getElementById('testEmail');
const loginEmailInput = document.getElementById('loginEmail');
const emailResults = document.getElementById('emailResults');
const logsResults = document.getElementById('logsResults');
const loginResults = document.getElementById('loginResults');

// Event listeners
document.addEventListener('DOMContentLoaded', verificarAuth);
btnTestEmail.addEventListener('click', testearEmail);
btnCheckLogs.addEventListener('click', verificarLogs);
btnTestLogin.addEventListener('click', testearLogin);

// Verificar autenticación
async function verificarAuth() {
    if (!authToken) {
        mostrarError('No estás autenticado. <a href="/login.html" class="text-blue-400">Ir al login</a>');
        return;
    }

    try {
        const response = await fetch('/api/auth/estado', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Token inválido');
        }

        const data = await response.json();
        if (data.usuario.rol !== 'Administrador') {
            mostrarError('Solo los administradores pueden acceder a esta página.');
            return;
        }

        console.log('✅ Usuario autenticado:', data.usuario);

    } catch (error) {
        mostrarError('Error de autenticación. <a href="/login.html" class="text-blue-400">Ir al login</a>');
    }
}

// Testear configuración de email
async function testearEmail() {
    const email = testEmailInput.value.trim() || 'soporte.liborina@gmail.com';
    
    btnTestEmail.disabled = true;
    btnTestEmail.textContent = 'Probando...';
    
    try {
        const response = await fetch('/api/diagnostic/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        mostrarResultado(emailResults, data, 'Resultado del Test de Email');

    } catch (error) {
        mostrarError('Error en la prueba: ' + error.message, emailResults);
    } finally {
        btnTestEmail.disabled = false;
        btnTestEmail.textContent = '🧪 Probar Envío de Email';
    }
}

// Verificar logs del sistema
async function verificarLogs() {
    btnCheckLogs.disabled = true;
    btnCheckLogs.textContent = 'Obteniendo...';
    
    try {
        const response = await fetch('/api/diagnostic/logs', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        mostrarResultado(logsResults, data, 'Información del Sistema');

    } catch (error) {
        mostrarError('Error obteniendo logs: ' + error.message, logsResults);
    } finally {
        btnCheckLogs.disabled = false;
        btnCheckLogs.textContent = '📋 Obtener Info del Sistema';
    }
}

// Testear login completo
async function testearLogin() {
    const email = loginEmailInput.value.trim() || 'soporte.liborina@gmail.com';
    
    btnTestLogin.disabled = true;
    btnTestLogin.textContent = 'Probando...';
    
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
            mostrarExito(`✅ Token solicitado exitosamente para ${email}. Revisa los logs de Vercel para ver el token.`, loginResults);
        } else {
            mostrarError(`❌ Error: ${data.error}`, loginResults);
        }

    } catch (error) {
        mostrarError('Error en la prueba: ' + error.message, loginResults);
    } finally {
        btnTestLogin.disabled = false;
        btnTestLogin.textContent = '🚀 Probar Login';
    }
}

// Mostrar resultado formateado
function mostrarResultado(container, data, titulo) {
    container.innerHTML = `
        <div class="bg-gray-700 rounded p-4">
            <h4 class="font-semibold mb-2">${titulo}</h4>
            <pre class="text-xs overflow-x-auto text-green-300">${JSON.stringify(data, null, 2)}</pre>
        </div>
    `;
}

// Mostrar error
function mostrarError(mensaje, container = document.body) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-900 border border-red-600 text-red-300 p-4 rounded mb-4';
    errorDiv.innerHTML = `❌ ${mensaje}`;
    
    if (container === document.body) {
        document.querySelector('.container').prepend(errorDiv);
    } else {
        container.innerHTML = '';
        container.appendChild(errorDiv);
    }
}

// Mostrar éxito
function mostrarExito(mensaje, container) {
    container.innerHTML = `
        <div class="bg-green-900 border border-green-600 text-green-300 p-4 rounded">
            ${mensaje}
        </div>
    `;
}