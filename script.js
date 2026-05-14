// === 🔄 SISTEMA DE ACTUALIZACIÓN AUTOMÁTICA ===
const APP_VERSION = '2026.02.12'; // ⚠️ ¡ACTUALIZA ESTA FECHA EN CADA DEPLOY!
(function() {
    // Verificar versión al cargar
    const storedVersion = localStorage.getItem('app_version');
    
    if (storedVersion && storedVersion !== APP_VERSION) {
        console.log(`[UPDATE] Versión desactualizada detectada: ${storedVersion} → ${APP_VERSION}`);
        localStorage.setItem('app_version', APP_VERSION);
        
        // Forzar recarga después de 1.5 segundos (tiempo suficiente para que el DOM cargue)
        setTimeout(() => {
            if (confirm('🔄 Nueva versión disponible\n\n¿Recargar para ver las mejoras más recientes?')) {
                window.location.reload(true);
            }
        }, 1500);
    } else {
        localStorage.setItem('app_version', APP_VERSION);
    }
    
    // Registrar Service Worker para actualizaciones futuras
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/autobuseslebrija/service-worker.js')
                .then(registration => {
                    console.log('[SW] Service Worker registrado correctamente');
                    
                    // Verificar actualizaciones cada 30 segundos
                    setInterval(() => {
                        registration.update();
                    }, 30000);
                    
                    // Escuchar cuando haya una nueva versión instalada
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        
                        newWorker.addEventListener('statechange', () => {
                            // Cuando el nuevo SW esté instalado y esperando
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('[SW] Nueva versión instalada y esperando');
                                
                                // Mostrar banner de actualización
                                const updateBanner = document.createElement('div');
                                updateBanner.id = 'update-banner';
                                updateBanner.style.cssText = `
                                    position: fixed;
                                    top: 0;
                                    left: 0;
                                    width: 100%;
                                    background: linear-gradient(135deg, #4CAF50, #2E7D32);
                                    color: white;
                                    text-align: center;
                                    padding: 15px;
                                    font-weight: bold;
                                    font-size: 1.1rem;
                                    z-index: 10001;
                                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    gap: 15px;
                                    animation: slideDown 0.3s ease;
                                `;
                                updateBanner.innerHTML = `
                                    <span>✨</span>
                                    <span>Nueva versión disponible</span>
                                    <button id="reload-btn" style="
                                        background: white;
                                        color: #2E7D32;
                                        border: none;
                                        padding: 8px 20px;
                                        border-radius: 20px;
                                        font-weight: bold;
                                        cursor: pointer;
                                        margin-left: 15px;
                                        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                                    ">Actualizar ahora</button>
                                    <button id="dismiss-btn" style="
                                        background: rgba(255,255,255,0.2);
                                        color: white;
                                        border: 1px solid white;
                                        padding: 8px 15px;
                                        border-radius: 20px;
                                        cursor: pointer;
                                        margin-left: 10px;
                                    ">Más tarde</button>
                                `;
                                document.body.prepend(updateBanner);
                                
                                // Event listeners para los botones
                                document.getElementById('reload-btn').addEventListener('click', () => {
                                    window.location.reload(true);
                                });
                                
                                document.getElementById('dismiss-btn').addEventListener('click', () => {
                                    window.location.reload(true);
                                });
                                
                                // Auto-recargar después de 30 segundos si no se interactúa
                                setTimeout(() => {
                                    if (document.getElementById('update-banner')) {
                                        console.log('[SW] Recargando automáticamente para aplicar actualización');
                                        window.location.reload(true);
                                    }
                                }, 30000);
                            }
                        });
                    });
                    
                    // Escuchar mensaje del Service Worker sobre actualización
                    navigator.serviceWorker.addEventListener('message', event => {
                        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                            console.log(`[SW] Actualización disponible: ${event.data.version}`);
                        }
                    });
                })
                .catch(error => {
                    console.error('[SW] Error al registrar Service Worker:', error);
                    
                    // Si falla el registro, mostrar advertencia
                    if (window.location.protocol === 'https:') {
                        setTimeout(() => {
                            const warning = document.createElement('div');
                            warning.style.cssText = `
                                position: fixed;
                                bottom: 20px;
                                right: 20px;
                                background: #ff9800;
                                color: white;
                                padding: 15px;
                                border-radius: 10px;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                                z-index: 10000;
                                max-width: 300px;
                                font-weight: bold;
                                text-align: center;
                            `;
                            warning.innerHTML = '⚠️ Versión desactualizada<br>Recarga la página para ver mejoras';
                            document.body.appendChild(warning);
                            
                            // Auto-ocultar después de 8 segundos
                            setTimeout(() => {
                                warning.style.opacity = '0';
                                warning.style.transition = 'opacity 0.5s';
                                setTimeout(() => warning.remove(), 500);
                            }, 8000);
                        }, 3000);
                    }
                });
        });
    }
})();

// === ⚙️ SISTEMA DEMO ===
const DEMO_ENABLED = false;   // ← Cambia a false para desactivar DEMO y ocultar el banner
const DEMO_DAYS = 7;        // Días de prueba

function initDemo() {
    if (!DEMO_ENABLED) return null;

    const now = new Date();
    const demoKey = 'autobuses_lebrija_demo_2026';
    const stored = localStorage.getItem(demoKey);

    let startDate, daysLeft;

    if (stored) {
        startDate = new Date(parseInt(stored));
        const elapsed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        daysLeft = Math.max(0, DEMO_DAYS - elapsed);
    } else {
        startDate = now;
        localStorage.setItem(demoKey, startDate.getTime().toString());
        daysLeft = DEMO_DAYS;
    }

    return { isActive: daysLeft > 0, daysLeft, startDate };
}

const demo = initDemo();

// === 🔒 SISTEMA DE SEGURIDAD: SOLO FUNCIONA ONLINE ===
(function() {
    // Verificar conexión a internet al cargar
    function checkConnection() {
        const statusElement = document.getElementById('connection-status');
        
        if (!navigator.onLine) {
            // Mostrar mensaje de error
            if (!statusElement) {
                const errorDiv = document.createElement('div');
                errorDiv.id = 'connection-status';
                errorDiv.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    background: linear-gradient(135deg, #ff4444, #cc0000);
                    color: white;
                    text-align: center;
                    padding: 15px;
                    font-weight: bold;
                    font-size: 1.1rem;
                    z-index: 10000;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                `;
                errorDiv.innerHTML = '⚠️ SIN CONEXIÓN A INTERNET - Esta aplicación requiere conexión para funcionar';
                document.body.prepend(errorDiv);
            } else {
                statusElement.style.display = 'flex';
            }
            
            // Deshabilitar toda la funcionalidad
            document.body.style.opacity = '0.6';
            document.body.style.pointerEvents = 'none';
            
            // Mostrar mensaje en el contenedor principal
            const scheduleView = document.getElementById('scheduleView');
            if (scheduleView) {
                scheduleView.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: white; border-radius: 12px; margin-top: 20px;">
                        <div style="font-size: 4rem; margin-bottom: 20px;">🔌</div>
                        <h2 style="color: #cc0000; margin-bottom: 15px;">Sin conexión a internet</h2>
                        <p style="font-size: 1.1rem; color: #555; margin-bottom: 25px;">
                            Esta aplicación requiere conexión a internet para funcionar.<br>
                            Por favor, verifica tu conexión y recarga la página.
                        </p>
                        <button onclick="location.reload()" style="
                            background: linear-gradient(135deg, #A8C5B5, #8BA89A);
                            color: white;
                            border: none;
                            padding: 12px 35px;
                            border-radius: 25px;
                            font-size: 1.1rem;
                            font-weight: 600;
                            cursor: pointer;
                            box-shadow: 0 4px 15px rgba(139, 168, 154, 0.3);
                            transition: all 0.3s ease;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            Recargar página
                        </button>
                    </div>
                `;
            }
            return false;
        }
        
        // Conexión restablecida
        if (statusElement) {
            statusElement.style.display = 'none';
        }
        document.body.style.opacity = '1';
        document.body.style.pointerEvents = 'auto';
        return true;
    }

    // Verificar al cargar la página
    window.addEventListener('load', () => {
        if (!checkConnection()) {
            console.warn('App iniciada sin conexión - inicialización detenida');
        }
    });

    // Verificar periódicamente (cada 10 segundos)
    setInterval(checkConnection, 10000);

    // Escuchar cambios de conexión
    window.addEventListener('online', () => {
        console.log('Conexión restablecida');
        checkConnection();
        // Mostrar mensaje de confirmación
        const confirmBanner = document.createElement('div');
        confirmBanner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: linear-gradient(135deg, #4CAF50, #2E7D32);
            color: white;
            text-align: center;
            padding: 12px;
            font-weight: bold;
            font-size: 1.1rem;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        confirmBanner.textContent = '✅ Conexión restablecida - La aplicación está funcionando correctamente';
        document.body.prepend(confirmBanner);
        
        setTimeout(() => {
            confirmBanner.style.opacity = '0';
            confirmBanner.style.transition = 'opacity 0.5s';
            setTimeout(() => confirmBanner.remove(), 500);
        }, 3000);
    });

    window.addEventListener('offline', () => {
        console.warn('Conexión perdida');
        checkConnection();
    });
})();

// Reset stop selection when changing line, filter or direction
function resetStopSelection() {
    currentStop = '';
    const stopSelect = document.getElementById('stopSelect');
    if (stopSelect) {
        stopSelect.value = '';
    }
}

// Datos de horarios de todas las líneas - ¡COMPLETOS!
const busSchedules = {
    urbana: {
        laborables: {
            stops: [
                { name: 'Hospital', times: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00'] },
                { name: 'Plaza de Abastos', times: ['8:03', '9:03', '10:03', '11:03', '12:03', '13:03'] },
                { name: 'José Fernández Ruiz - Cantarería', times: ['8:05', '9:05', '10:05', '11:05', '12:05', '13:05'] },
                { name: 'José Fernández Ruiz C/Roma', times: ['8:07', '9:07', '10:07', '11:07', '12:07', '13:07'] },
                { name: 'Glorieta María Auxiliadora', times: ['8:08', '9:08', '10:08', '11:08', '12:08', '13:08'] },
                { name: 'Avenida Canga C/Francia', times: ['8:11', '9:11', '10:11', '11:11', '12:11', '13:11'] },
                { name: 'Avenida Canga C/Hijas Caridad', times: ['8:13', '9:13', '10:13', '11:13', '12:13', '13:13'] },
                { name: 'Avenida Canga Pza Campiña', times: ['8:15', '9:15', '10:15', '11:15', '12:15', '13:15'] },
                { name: 'Venta Renaul', times: ['8:16', '9:16', '10:16', '11:16', '12:16', '13:16'] },
                { name: 'A. Calvo Ruiz Sta Brígida', times: ['8:17', '9:17', '10:17', '11:17', '12:17', '13:17'] },
                { name: 'Plaza Manuela Murube', times: ['8:20', '9:20', '10:20', '11:20', '12:20', '13:20'] },
                { name: 'Cala de Vargas (Ajudisle)', times: ['8:21', '9:21', '10:21', '11:21', '12:21', '13:21'] },
                { name: 'Tetuán - Veracruz', times: ['8:22', '9:22', '10:22', '11:22', '12:22', '13:22'] },
                { name: 'Zancarrón - Jazmín', times: ['8:23', '9:23', '10:23', '11:23', '12:23', '13:23'] },
                { name: 'Reyes Católicos', times: ['8:24', '9:24', '10:24', '11:24', '12:24', '13:24'] },
                { name: 'Miguel Unamuno-Hta Macenas 1ª parada', times: ['8:25', '9:25', '10:25', '11:25', '12:25', '13:25'] },
                { name: 'Miguel Unamuno-Hta Macenas 2ª parada', times: ['8:26', '9:26', '10:26', '11:26', '12:26', '13:26'] },
                { name: 'Miguel Unamuno-Hta Macenas 3ª parada', times: ['8:27', '9:27', '10:27', '11:27', '12:27', '13:27'] },
                { name: 'Cañada Lebrija-Trebujena', times: ['8:30', '9:30', '10:30', '11:30', '12:30', '13:30'] },
                { name: 'Dr. José Viel (antiguo Lidl)', times: ['8:32', '9:32', '10:32', '11:32', '12:32', '13:32'] },
                { name: 'Avenida Andalucía', times: ['8:33', '9:33', '10:33', '11:33', '12:33', '13:33'] },
                { name: 'Ambulatorio', times: ['8:34', '9:34', '10:34', '11:34', '12:34', '13:34'] },
                { name: 'Plaza Manuela Murube', times: ['8:35', '9:35', '10:35', '11:35', '12:35', '13:35'] },
                { name: 'Cala de Vargas (Ajudisle)', times: ['8:36', '9:36', '10:36', '11:36', '12:36', '13:36'] },
                { name: 'Esquina Tetuán-Veracruz', times: ['8:37', '9:37', '10:37', '11:37', '12:37', '13:37'] },
                { name: 'Camino del Aceituno (Mercadona)', times: ['8:38', '9:38', '10:38', '11:38', '12:38', '13:38'] },
                { name: 'Hospital', times: ['8:40', '9:40', '10:40', '11:40', '12:40', '13:40'] }
            ]
        },
        sabados: {
            stops: [
                { name: 'Hospital', times: ['10:00', '11:00', '12:00'] },
                { name: 'Plaza de Abastos', times: ['10:03', '11:03', '12:03'] },
                { name: 'José Fernández Ruiz - Cantarería', times: ['10:05', '11:05', '12:05'] },
                { name: 'José Fernández Ruiz - C/Roma', times: ['10:07', '11:07', '12:07'] },
                { name: 'Glorieta María Auxiliadora', times: ['10:08', '11:08', '12:08'] },
                { name: 'Avda Canga - C/Francia', times: ['10:11', '11:11', '12:11'] },
                { name: 'Avda Canga - Hijas Caridad', times: ['10:13', '11:13', '12:13'] },
                { name: 'Avda Canga - Plaza Campiña', times: ['10:15', '11:15', '12:15'] },
                { name: 'Venta Renaul', times: ['10:16', '11:16', '12:16'] },
                { name: 'Antonio Calvo Ruiz - Sta Brigida', times: ['10:17', '11:17', '12:17'] },
                { name: 'Plaza Manuela Murube', times: ['10:20', '11:20', '12:20'] },
                { name: 'Cala de Vargas (Ajudisle)', times: ['10:21', '11:21', '12:21'] },
                { name: 'Tetuán - Veracruz', times: ['10:22', '11:22', '12:22'] },
                { name: 'Zancarrón - Jazmín', times: ['10:23', '11:23', '12:23'] },
                { name: 'Reyes Católicos', times: ['10:24', '11:24', '12:24'] },
                { name: 'Miguel Unamuno-Hta Macenas 1ª parada', times: ['10:25', '11:25', '12:25'] },
                { name: 'Miguel Unamuno-Hta Macenas 2ª parada', times: ['10:26', '11:26', '12:26'] },
                { name: 'Miguel Unamuno-Hta Macenas 3ª parada', times: ['10:27', '11:27', '12:27'] },
                { name: 'Cañada Lebrija-Trebujena', times: ['10:30', '11:30', '12:30'] },
                { name: 'Avda José Viel (Lidl)', times: ['10:32', '11:32', '12:32'] },
                { name: 'Avenida Andalucía', times: ['10:33', '11:33', '12:33'] },
                { name: 'Ambulatorio', times: ['10:34', '11:34', '12:34'] },
                { name: 'Plaza Manuela Murube', times: ['10:35', '11:35', '12:35'] },
                { name: 'Cala de Vargas (Ajudisle)', times: ['10:36', '11:36', '12:36'] },
                { name: 'Esquina Tetuán-Veracruz', times: ['10:37', '11:37', '12:37'] },
                { name: 'Camino del Aceituno (Mercadona)', times: ['10:38', '11:38', '12:38'] },
                { name: 'Hospital', times: ['10:40', '11:40', '12:40'] }
            ]
        },
        domingos: {
            stops: []
        }
    },
    renfe: {
        laborables: {
            stops: [
                { name: 'Plaza Manuela Murube (Asilo)', times: ['6:00', '6:50', '8:15', '9:00', '10:15', '11:30', '13:15', '15:10', '15:55', '16:20', '17:15', '18:00', '19:15', '20:00', '21:00'] },
                { name: 'Estación de Renfe', times: ['6:40', '7:45', '8:35', '9:35', '11:02', '12:00', '13:40', '15:20', '15:39', '16:45', '17:35', '18:30', '19:40', '20:45', '21:35'] }
            ]
        },
        sabados: {
            stops: [
                { name: 'Plaza Manuela Murube (Asilo)', times: ['9:00', '10:15', '11:30', '15:10', '16:20', '17:15', '18:00', '19:15', '20:00'] },
                { name: 'Estación de Renfe', times: ['9:35', '11:02', '12:00', '15:39', '16:45', '17:35', '18:30', '19:40', '20:45'] }
            ]
        },
        domingos: {
            stops: [
                { name: 'Plaza Manuela Murube (Asilo)', times: ['9:00', '10:15', '11:30', '15:10', '16:20', '17:15', '18:00', '19:15', '20:00'] },
                { name: 'Estación de Renfe', times: ['9:35', '11:02', '12:00', '15:39', '16:45', '17:35', '18:30', '19:40', '20:45'] }
            ]
        }
    },
    sevilla: {
        laborables: {
            ida: [
                { name: 'Chipiona', times: ['06:45', '09:00', '11:00', '13:00', '15:00', '16:00', '18:00', '20:00'], origin: true },
                { name: 'Lebrija', times: ['07:45', '10:00', '12:00', '14:00', '16:00', '17:00', '19:00', '21:00'], highlightOnly: true },
                { name: 'Sevilla', times: ['09:00', '11:15', '13:15', '15:15', '17:15', '18:15', '20:15', '22:15'], destination: true }
            ],
            vuelta: [
                { name: 'Sevilla', times: ['06:00', '07:00', '09:00', '11:00', '13:00', '13:45', '15:00', '17:00', '19:00'] },
                { name: 'Lebrija', times: ['07:15', '08:15', '10:15', '12:15', '14:15', '15:00', '16:15', '18:15', '20:15'], highlightOnly: true },
                { name: 'Chipiona', times: ['08:15', '09:15', '11:15', '13:15', '15:15', '16:00', '17:15', '19:15', '21:15'], destination: true }
            ]
        },
        sabados: {
            ida: [
                { name: 'Chipiona', times: ['08:00', '10:00', '16:00', '18:00', '20:00'], origin: true },
                { name: 'Lebrija', times: ['09:00', '11:00', '17:00', '19:00', '21:00'], highlightOnly: true },
                { name: 'Sevilla', times: ['10:15', '12:15', '18:15', '20:15', '22:15'], destination: true }
            ],
            vuelta: [
                { name: 'Sevilla', times: ['08:00', '10:00', '12:00', '16:00', '20:00'] },
                { name: 'Lebrija', times: ['09:15', '11:15', '13:15', '17:15', '21:15'], highlightOnly: true },
                { name: 'Chipiona', times: ['10:15', '12:15', '14:15', '18:15', '22:15'], destination: true }
            ]
        },
        domingos: {
            ida: [
                { name: 'Chipiona', times: ['08:00', '10:00', '16:00', '18:00', '20:00'], origin: true },
                { name: 'Lebrija', times: ['09:00', '11:00', '17:00', '19:00', '21:00'], highlightOnly: true },
                { name: 'Sevilla', times: ['10:15', '12:15', '18:15', '20:15', '22:15'], destination: true }
            ],
            vuelta: [
                { name: 'Sevilla', times: ['08:00', '10:00', '12:00', '16:00', '20:00'] },
                { name: 'Lebrija', times: ['09:15', '11:15', '13:15', '17:15', '21:15'], highlightOnly: true },
                { name: 'Chipiona', times: ['10:15', '12:15', '14:15', '18:15', '22:15'], destination: true }
            ]
        }
    }
};

// Variables globales - ¡DEFINIDAS!
let currentLine = 'urbana';
let currentFilter = 'laborables';
let currentStop = '';
let currentDirection = 'ida';
let deferredPrompt = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Verificar conexión antes de inicializar
    if (!navigator.onLine) {
        console.warn('App iniciada sin conexión - inicialización detenida');
        return;
    }
    
    // Inicializar demo banner (con fallback si no existe)
    try {
        initDemoBanner();
    } catch (e) {
        console.warn('Banner DEMO no encontrado, continuando sin él');
    }
    
    initDateDisplay();
    initEventListeners();
    loadStopsToSelect();
    loadSchedule(currentLine, currentFilter);
});

// Inicializar banner DEMO
function initDemoBanner() {
    const demoBanner = document.getElementById('demo-banner');
    
    if (!demoBanner) {
        console.warn('Elemento #demo-banner no encontrado en el DOM');
        return;
    }
    
    if (DEMO_ENABLED) {
        if (demo && demo.isActive) {
            demoBanner.textContent = `🔷 DEMO — Quedan ${demo.daysLeft} día${demo.daysLeft !== 1 ? 's' : ''} de prueba`;
            demoBanner.className = 'demo-banner';
        } else {
            demoBanner.textContent = '🔶 DEMO EXPIRADA — Funcionalidad limitada. Contacta para versión completa.';
            demoBanner.className = 'demo-banner expired';
        }
    } else {
        // Ocultar completamente el banner si DEMO desactivada
        demoBanner.style.display = 'none';
    }
}

// Mostrar fecha actual
function initDateDisplay() {
    const dateElement = document.getElementById('currentDate');
    if (!dateElement) return;
    
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    dateElement.textContent = now.toLocaleDateString('es-ES', options);
}

// Inicializar eventos
function initEventListeners() {
    // Cambiar línea
    document.querySelectorAll('.line-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Verificar conexión primero
            if (!navigator.onLine) {
                alert('⚠️ Necesitas conexión a internet para usar esta función');
                return;
            }
            
            if (DEMO_ENABLED && demo && !demo.isActive) {
                showDemoExpiredAlert();
                return;
            }
            
            document.querySelectorAll('.line-btn').forEach(b => b.classList.remove('active'));
            e.target.closest('.line-btn').classList.add('active');
            currentLine = e.target.closest('.line-btn').dataset.line;
            document.getElementById('scheduleTitle').textContent = getLineName(currentLine);
            
            // ✅ REINICIAR SELECCIÓN DE PARADA AL CAMBIAR DE LÍNEA
            resetStopSelection();
            
            // Mostrar/ocultar selector de sentido
            const directionSelector = document.getElementById('directionSelector');
            if (currentLine === 'sevilla') {
                if (directionSelector) directionSelector.style.display = 'block';
            } else {
                if (directionSelector) directionSelector.style.display = 'none';
            }
            
            loadStopsToSelect();
            loadSchedule(currentLine, currentFilter);
        });
    });

    // Cambiar filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Verificar conexión primero
            if (!navigator.onLine) {
                alert('⚠️ Necesitas conexión a internet para usar esta función');
                return;
            }
            
            if (DEMO_ENABLED && demo && !demo.isActive) {
                showDemoExpiredAlert();
                return;
            }
            
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            
            // ✅ REINICIAR SELECCIÓN DE PARADA AL CAMBIAR DE FILTRO
            resetStopSelection();
            
            loadStopsToSelect();
            loadSchedule(currentLine, currentFilter);
        });
    });

    // Cambiar parada
    const stopSelect = document.getElementById('stopSelect');
    if (stopSelect) {
        stopSelect.addEventListener('change', (e) => {
            // Verificar conexión primero
            if (!navigator.onLine) {
                alert('⚠️ Necesitas conexión a internet para usar esta función');
                return;
            }
            
            if (DEMO_ENABLED && demo && !demo.isActive) {
                showDemoExpiredAlert();
                return;
            }
            
            currentStop = e.target.value;
            loadSchedule(currentLine, currentFilter);
        });
    }

    // Cambiar sentido (solo para línea Sevilla)
    const directionSelect = document.getElementById('directionSelect');
    if (directionSelect) {
        directionSelect.addEventListener('change', (e) => {
            // Verificar conexión primero
            if (!navigator.onLine) {
                alert('⚠️ Necesitas conexión a internet para usar esta función');
                return;
            }
            
            if (DEMO_ENABLED && demo && !demo.isActive) {
                showDemoExpiredAlert();
                return;
            }
            
            currentDirection = e.target.value;
            
            // ✅ REINICIAR SELECCIÓN DE PARADA AL CAMBIAR DE DIRECCIÓN
            resetStopSelection();
            
            loadStopsToSelect();
            loadSchedule(currentLine, currentFilter);
        });
    }

    // Botón de instalación
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.addEventListener('click', installApp);
    }
}

// Obtener nombre de la línea
function getLineName(line) {
    const names = {
        'urbana': 'Línea Urbana',
        'renfe': 'Línea Renfe',
        'sevilla': 'Lebrija-Sevilla-Chipiona'
    };
    return names[line] || 'Horarios';
}

// Cargar paradas al selector
function loadStopsToSelect() {
    // Verificar conexión primero
    if (!navigator.onLine) {
        console.warn('Carga de paradas cancelada: sin conexión');
        return;
    }
    
    const select = document.getElementById('stopSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Todas las paradas</option>';
    
    if (busSchedules[currentLine] && busSchedules[currentLine][currentFilter]) {
        const data = busSchedules[currentLine][currentFilter];
        let stops = [];
        
        // Para la línea Sevilla-Chipiona, manejar ida y vuelta y solo mostrar orígenes
        if (currentLine === 'sevilla' && data.ida && data.vuelta) {
            const directionData = data[currentDirection];
            stops = directionData.filter(stop => stop.origin || stop.highlightOnly);
        } else if (data.stops) {
            stops = data.stops;
        }
        
        stops.forEach((stop, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = stop.name;
            select.appendChild(option);
        });
    }
}

// Cargar horarios
function loadSchedule(line, filter) {
    // Verificar conexión primero
    if (!navigator.onLine) {
        console.warn('Carga de horarios cancelada: sin conexión');
        const scheduleView = document.getElementById('scheduleView');
        if (scheduleView) {
            scheduleView.innerHTML = `
                <div class="no-schedules">
                    <p>⚠️ Conexión a internet requerida para ver los horarios</p>
                    <button onclick="location.reload()" class="install-btn" style="margin-top: 15px;">
                        Recargar página
                    </button>
                </div>
            `;
        }
        return;
    }
    
    const scheduleView = document.getElementById('scheduleView');
    if (!scheduleView) return;
    
    scheduleView.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando horarios...</p></div>';

    setTimeout(() => {
        if (currentStop === '') {
            renderFullRoute(line, filter);
        } else {
            renderSingleStop(line, filter, parseInt(currentStop));
        }
    }, 500);
}

// Obtener el próximo horario de una parada
function getNextTimeIndex(times) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    for (let i = 0; i < times.length; i++) {
        const [h, m] = times[i].split(':').map(Number);
        const scheduleTime = h * 60 + m;
        if (scheduleTime > currentTime) {
            return i;
        }
    }
    return -1;
}

// Renderizar ruta completa
function renderFullRoute(line, filter) {
    const scheduleView = document.getElementById('scheduleView');
    if (!scheduleView) return;
    
    if (!busSchedules[line] || !busSchedules[line][filter]) {
        scheduleView.innerHTML = '<div class="no-schedules"><p>No hay horarios disponibles para esta línea</p></div>';
        return;
    }
    
    const data = busSchedules[line][filter];
    let html = '';
    
    // Para la línea Sevilla-Chipiona, mostrar ida y vuelta separadamente
    if (line === 'sevilla' && data.ida && data.vuelta) {
        html += '<div class="route-direction"><h3>Ida: Chipiona → Lebrija → Sevilla</h3>';
        html += renderRouteSection(data.ida, 'ida');
        html += '</div>';
        
        html += '<div class="route-direction"><h3>Vuelta: Sevilla → Lebrija → Chipiona</h3>';
        html += renderRouteSection(data.vuelta, 'vuelta');
        html += '</div>';
    } else if (data.stops) {
        html += '<div class="full-route">';
        data.stops.forEach(stop => {
            html += renderStopCard(stop);
        });
        html += '</div>';
    } else {
        scheduleView.innerHTML = '<div class="no-schedules"><p>No hay horarios disponibles para este día</p></div>';
        return;
    }
    
    scheduleView.innerHTML = html;
}

// Renderizar sección de ruta
function renderRouteSection(stops, direction) {
    let html = '<div class="full-route">';
    stops.forEach(stop => {
        html += renderStopCard(stop, direction);
    });
    html += '</div>';
    return html;
}

// Renderizar tarjeta de parada
function renderStopCard(stop, direction = null) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const isOrigin = (direction === 'ida' && (stop.name === 'Chipiona' || stop.name === 'Lebrija')) ||
                     (direction === 'vuelta' && (stop.name === 'Sevilla' || stop.name === 'Lebrija'));
    
    const nextTimeIndex = getNextTimeIndex(stop.times);
    
    let html = `
        <div class="stop-card">
            <div class="stop-name">
                ${stop.name}
                ${stop.origin ? '<span class="origin-label">Origen</span>' : ''}
                ${stop.destination ? '<span class="destination-label">Destino</span>' : ''}
            </div>
            <div class="stop-times">
    `;
    
    stop.times.forEach((time, index) => {
        const [h, m] = time.split(':').map(Number);
        const scheduleTime = h * 60 + m;
        
        let isNext = false;
        
        if (stop.highlightOnly) {
            isNext = (index === nextTimeIndex);
        } else if (currentLine === 'renfe') {
            isNext = (index === nextTimeIndex);
        } else if (currentLine === 'sevilla') {
            isNext = false;
        } else {
            isNext = isOrigin && scheduleTime > currentTime && scheduleTime <= currentTime + 60;
        }
        
        html += `<span class="time-badge ${isNext ? 'highlight' : ''}">${time}</span>`;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// Renderizar vista de parada única
function renderSingleStop(line, filter, stopIndex) {
    const scheduleView = document.getElementById('scheduleView');
    if (!scheduleView) return;
    
    if (!busSchedules[line] || !busSchedules[line][filter]) {
        scheduleView.innerHTML = '<div class="no-schedules"><p>No hay horarios disponibles para esta línea</p></div>';
        return;
    }
    
    const data = busSchedules[line][filter];
    let stop;
    
    if (line === 'sevilla' && data.ida && data.vuelta) {
        const directionData = data[currentDirection];
        stop = directionData[stopIndex];
    } else if (data.stops && stopIndex < data.stops.length) {
        stop = data.stops[stopIndex];
    } else {
        scheduleView.innerHTML = '<div class="no-schedules"><p>Parada no encontrada</p></div>';
        return;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const nextTimeIndex = getNextTimeIndex(stop.times);
    
    let html = `
        <div class="single-stop-view">
            <div class="single-stop-name">📍 ${stop.name}</div>
            <div class="times-grid">
    `;
    
    stop.times.forEach((time, index) => {
        const [h, m] = time.split(':').map(Number);
        const scheduleTime = h * 60 + m;
        const isPast = scheduleTime < currentTime;
        
        let isNext = false;
        let status = '';
        
        if (stop.highlightOnly || currentLine === 'renfe') {
            isNext = (index === nextTimeIndex);
            status = isNext ? 'Próximo' : (isPast ? 'Pasado' : 'Hoy');
        } else if (currentLine === 'sevilla') {
            isNext = false;
            status = isPast ? 'Pasado' : 'Hoy';
        } else {
            isNext = scheduleTime > currentTime && scheduleTime <= currentTime + 60;
            status = isNext ? 'Próximo' : (isPast ? 'Pasado' : 'Hoy');
        }
        
        html += `
            <div class="time-card ${isNext ? 'highlight' : ''}">
                <div class="time">${time}</div>
                <div class="status">${status}</div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    scheduleView.innerHTML = html;
}

// Instalar app manualmente
function installApp() {
    // Verificar conexión primero
    if (!navigator.onLine) {
        alert('⚠️ Necesitas conexión a internet para instalar la aplicación');
        return;
    }
    
    if (DEMO_ENABLED && demo && !demo.isActive) {
        showDemoExpiredAlert();
        return;
    }
    
    if (deferredPrompt) {
        // Mostrar confirmación antes de instalar (SIN mencionar offline)
        if (confirm('¿Quieres instalar la aplicación de Autobuses Lebrija?\n\n✅ Acceso rápido desde tu pantalla de inicio\n✅ Notificaciones de próximos autobuses\n✅ Interfaz optimizada para móvil\n\n⚠️ IMPORTANTE: Requiere conexión a internet para funcionar')) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    alert('✅ ¡App instalada correctamente!\n\n⚠️ IMPORTANTE: Esta aplicación requiere conexión a internet para funcionar.');
                    // Ocultar botón después de instalar
                    const installBtn = document.getElementById('installBtn');
                    if (installBtn) installBtn.style.display = 'none';
                } else {
                    alert('❌ Instalación cancelada');
                }
                deferredPrompt = null;
            });
        }
    } else {
        // Mostrar instrucciones detalladas (SIN mencionar offline)
        showInstallInstructions();
    }
}

// Mostrar alerta de demo expirada
function showDemoExpiredAlert() {
    alert('⚠️ Versión DEMO expirada.\n\nContacta con el administrador para obtener la versión completa con acceso a todos los horarios y funcionalidades.');
}

// Mostrar instrucciones detalladas para instalar manualmente
function showInstallInstructions() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(74, 83, 85, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; width: 100%; max-width: 500px; padding: 25px; box-shadow: 0 10px 40px rgba(139, 168, 154, 0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: #8BA89A; margin: 0; font-size: 1.4rem; font-weight: 700;">📲 Instalar App</h3>
                <button id="closeModalBtn" style="background: none; border: none; color: #4A5355; font-size: 1.5rem; cursor: pointer; padding: 5px;">×</button>
            </div>
            
            <div style="background: #F5F1E8; border-left: 4px solid #A8C5B5; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
                <p style="margin: 0; line-height: 1.5; color: #4A5355;">
                    <strong style="color: #8BA89A;">💡 ¿Por qué instalar la app?</strong><br>
                    • Acceso rápido desde tu pantalla de inicio<br>
                    • Notificaciones de próximos autobuses<br>
                    • Interfaz optimizada para móvil<br>
                    • <span style="color: #cc0000; font-weight: bold;">⚠️ Requiere conexión a internet para funcionar</span>
                </p>
            </div>
            
            <div id="instructions-android" style="display: none; margin-bottom: 25px;">
                <h4 style="color: #A8C5B5; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; font-weight: 600;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14Z" fill="#A8C5B5"/>
                    </svg>
                    En Android (Chrome)
                </h4>
                <ol style="padding-left: 20px; line-height: 1.6; color: #4A5355;">
                    <li>Abre el menú de Chrome (⋮)</li>
                    <li>Selecciona "Instalar app"</li>
                    <li>Confirma con "Añadir"</li>
                </ol>
            </div>
            
            <div id="instructions-ios" style="display: none; margin-bottom: 25px;">
                <h4 style="color: #A8C5B5; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; font-weight: 600;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14Z" fill="#A8C5B5"/>
                    </svg>
                    En iPhone (Safari)
                </h4>
                <ol style="padding-left: 20px; line-height: 1.6; color: #4A5355;">
                    <li>Toca el botón "Compartir" <span style="background: #E0DDD6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em;">↗</span></li>
                    <li>Desplázate y selecciona "Añadir a pantalla de inicio"</li>
                    <li>Toca "Añadir" en la esquina superior derecha</li>
                </ol>
            </div>
            
            <div id="instructions-desktop" style="display: none; margin-bottom: 25px;">
                <h4 style="color: #A8C5B5; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; font-weight: 600;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14Z" fill="#A8C5B5"/>
                    </svg>
                    En Escritorio (Chrome/Edge)
                </h4>
                <ol style="padding-left: 20px; line-height: 1.6; color: #4A5355;">
                    <li>Mira la barra de direcciones</li>
                    <li>Haz clic en el icono <span style="background: #E0DDD6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em;">+</span> o <span style="background: #E0DDD6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em;">⬇</span></li>
                    <li>Selecciona "Instalar"</li>
                </ol>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button id="closeModalBtn2" style="flex: 1; background: #F5F1E8; border: 2px solid #A8C5B5; padding: 12px; border-radius: 8px; color: #4A5355; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                    Cerrar
                </button>
            </div>
            
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #E0DDD6; text-align: center; color: #cc0000; font-weight: bold;">
                ⚠️ Esta aplicación REQUIERE conexión a internet para funcionar
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Detectar sistema operativo
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) {
        document.getElementById('instructions-android').style.display = 'block';
    } else if (/iPad|iPhone|iPod/.test(ua)) {
        document.getElementById('instructions-ios').style.display = 'block';
    } else {
        document.getElementById('instructions-desktop').style.display = 'block';
    }
    
    // Event listeners para cerrar modal
    document.getElementById('closeModalBtn').addEventListener('click', () => modal.remove());
    document.getElementById('closeModalBtn2').addEventListener('click', () => modal.remove());
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Actualizar fecha cada minuto
setInterval(() => {
    initDateDisplay();
}, 60000);

// Actualizar banner DEMO cada minuto
setInterval(() => {
    if (DEMO_ENABLED && demo) {
        const now = new Date();
        const elapsed = Math.floor((now - demo.startDate) / (1000 * 60 * 60 * 24));
        const daysLeft = Math.max(0, DEMO_DAYS - elapsed);
        
        const demoBanner = document.getElementById('demo-banner');
        if (demoBanner) {
            if (daysLeft > 0) {
                demoBanner.textContent = `🔷 DEMO — Quedan ${daysLeft} día${daysLeft !== 1 ? 's' : ''} de prueba`;
                demoBanner.className = 'demo-banner';
            } else {
                demoBanner.textContent = '🔶 DEMO EXPIRADA — Funcionalidad limitada. Contacta para versión completa.';
                demoBanner.className = 'demo-banner expired';
            }
        }
    }
}, 60000);

// Animaciones CSS para banners
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-100%); opacity: 0; }
    }
`;
document.head.appendChild(style);