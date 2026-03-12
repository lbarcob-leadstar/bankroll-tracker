// Extensión Chrome - Sincronización con Firestore REST API
console.log('📄 popup.js se está cargando...');

let betType = 'simple';

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDxpJhpatZR6qpSQU8pucZHp8HGgSCKRbg",
    projectId: "bankroll-tracker-79d49"
};

// ID único del navegador/extensión
const EXTENSION_USER_ID = localStorage.getItem('extensionUserId') || `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
if (!localStorage.getItem('extensionUserId')) {
    localStorage.setItem('extensionUserId', EXTENSION_USER_ID);
}

// Verificar sesión activa
function checkSession() {
    const userEmail = sessionStorage.getItem('userEmail');
    return !!userEmail;
}

// Mostrar pantalla de login o principal
function updateUI() {
    const loginScreen = document.getElementById('loginScreen');
    const mainScreen = document.getElementById('mainScreen');
    
    if (checkSession()) {
        loginScreen.style.display = 'none';
        mainScreen.style.display = 'block';
    } else {
        loginScreen.style.display = 'flex';
        mainScreen.style.display = 'none';
    }
}

// Manejar clics en el botón de logout globalmente
document.addEventListener('click', (e) => {
    if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
        console.log('🖱️ Click en logout detectado!');
        e.preventDefault();
        e.stopPropagation();
        const confirmed = confirm('¿Estás seguro de que deseas cerrar sesión?');
        console.log('Confirmación del usuario:', confirmed);
        if (confirmed) {
            logout();
        }
    }
}, true);

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando extensión con Firestore');
    console.log('📱 Extension ID:', EXTENSION_USER_ID);
    
    // Configurar el formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (email && password) {
                // Guardar sesión simple (en un app real sería autenticación real)
                sessionStorage.setItem('userEmail', email);
                sessionStorage.setItem('userName', email.split('@')[0]);
                
                // Limpiar formulario
                loginForm.reset();
                
                // Mostrar mensaje de bienvenida
                const message = document.getElementById('loginMessage');
                message.textContent = `✅ Bienvenido, ${email.split('@')[0]}`;
                message.className = 'login-message success';
                
                // Actualizar UI
                setTimeout(() => {
                    updateUI();
                    
                    // Inicializar la pantalla principal
                    initializeDateTodayinForm();
                    setupBetTypeSelector();
                    setupAddMarketButton();
                    loadRecentBets();
                    updateSyncStatus('ready');
                    
                    document.getElementById('betForm').addEventListener('submit', handleFormSubmit);
                }, 500);
            } else {
                const message = document.getElementById('loginMessage');
                message.textContent = '❌ Por favor completa los campos';
                message.className = 'login-message error';
            }
        });
    }
    
    // Verificar si hay sesión activa
    updateUI();
    
    if (checkSession()) {
        console.log('✅ Sesión activa, inicializando interfaz principal');
        initializeDateTodayinForm();
        setupBetTypeSelector();
        setupAddMarketButton();
        loadRecentBets();
        updateSyncStatus('ready');
        
        const betForm = document.getElementById('betForm');
        console.log('📝 betForm encontrado:', !!betForm);
        
        if (betForm) {
            console.log('📋 Registrando evento submit en betForm');
            betForm.addEventListener('submit', handleFormSubmit);
            console.log('✅ Evento submit registrado');
        } else {
            console.error('❌ No se encontró betForm');
        }
        
        // Verificar que el botón existe
        const logoutBtn = document.getElementById('logoutBtn');
        console.log('✅ Botón logout encontrado en DOMContentLoaded:', !!logoutBtn);
    }
});

function initializeDateTodayinForm() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

function setupBetTypeSelector() {
    document.querySelectorAll('.bet-type-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.bet-type-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            betType = opt.dataset.type;
            toggleAddMarketBtn();
        });
    });
}

function setupAddMarketButton() {
    const addMarketBtn = document.getElementById('addMarketBtn');
    if (addMarketBtn) {
        addMarketBtn.addEventListener('click', addMarketField);
    }
}

function logout() {
    // Limpiar sessionStorage completamente
    sessionStorage.removeItem('bets');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
    
    // Notificar al usuario en consola
    console.log('✅ Sesión cerrada correctamente');
    
    // Volver a mostrar pantalla de login
    const loginScreen = document.getElementById('loginScreen');
    const mainScreen = document.getElementById('mainScreen');
    
    loginScreen.style.display = 'flex';
    mainScreen.style.display = 'none';
    
    // Limpiar formulario
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.reset();
        document.getElementById('loginEmail').focus();
    }
    
    // Mostrar mensaje de confirmación
    const message = document.getElementById('loginMessage');
    message.textContent = '👋 Sesión cerrada. Vuelve a iniciar sesión.';
    message.className = 'login-message success';
    
    setTimeout(() => {
        message.textContent = '';
    }, 3000);
}


function toggleAddMarketBtn() {
    const addBtn = document.getElementById('addMarketBtn');
    if (betType === 'combined') {
        addBtn.style.display = 'block';
    } else {
        addBtn.style.display = 'none';
        document.getElementById('additionalMarketsContainer').innerHTML = '';
    }
}

function addMarketField() {
    const container = document.getElementById('additionalMarketsContainer');
    const index = container.children.length;
    const marketDiv = document.createElement('div');
    marketDiv.className = 'market-input-row additional-market';
    marketDiv.id = `additionalMarket${index}`;
    marketDiv.innerHTML = `
        <input type="text" class="additional-market-input" placeholder="Ej: Gana visitante, Menos de 3.5">
        <button type="button" class="remove-market-btn" onclick="removeMarketField(${index})">✕</button>
    `;
    container.appendChild(marketDiv);
}

function removeMarketField(index) {
    const market = document.getElementById(`additionalMarket${index}`);
    if (market) market.remove();
}

function collectMarkets() {
    const markets = [];
    const mainMarket = document.getElementById('market').value;
    if (mainMarket) markets.push(mainMarket);
    
    document.querySelectorAll('.additional-market-input').forEach(input => {
        if (input.value) markets.push(input.value);
    });
    
    return markets;
}

function handleFormSubmit(event) {
    event.preventDefault();
    console.log('🎯 handleFormSubmit - Iniciando guardado de apuesta');
    
    const btnText = document.getElementById('btnText');
    const btn = document.getElementById('saveBetBtn');
    
    console.log('🔘 Botón encontrado:', !!btn, 'btnText encontrado:', !!btnText);
    
    btn.disabled = true;
    btnText.textContent = 'Guardando...';
    
    const markets = collectMarkets();
    console.log('📍 Mercados recolectados:', markets.length, markets);
    
    if (markets.length === 0) {
        console.error('❌ No hay mercados');
        showMessage('Debes especificar al menos un mercado', 'error');
        btn.disabled = false;
        btnText.textContent = 'Guardar Apuesta';
        return;
    }
    
    const bet = {
        id: Date.now().toString(),
        type: betType,
        house: document.getElementById('house').value,
        sport: document.getElementById('sport').value,
        event: document.getElementById('event').value,
        market: markets.length === 1 ? markets[0] : markets,
        markets: markets,
        odds: parseFloat(document.getElementById('odds').value),
        stake: parseFloat(document.getElementById('stake').value),
        status: document.getElementById('status').value,
        date: document.getElementById('date').value,
        createdAt: new Date().toISOString()
    };
    
    console.log('💾 Apuesta creada:', bet);
    
    // Guardar en sesión (se borra al cerrar la extensión)
    const bets = JSON.parse(sessionStorage.getItem('bets') || '[]');
    bets.push(bet);
    sessionStorage.setItem('bets', JSON.stringify(bets));
    console.log('✅ Apuesta guardada en sessionStorage. Total:', bets.length);
    
    // Guardar en Firestore
    saveBetToFirestore(bet, bets, () => {
        console.log('✅ Callback de saveBetToFirestore ejecutado');
        
        // Reset form
        document.getElementById('betForm').reset();
        initializeDateTodayinForm();
        document.querySelectorAll('.bet-type-option').forEach(o => o.classList.remove('active'));
        document.querySelector('.bet-type-option[data-type="simple"]').classList.add('active');
        betType = 'simple';
        document.getElementById('additionalMarketsContainer').innerHTML = '';
        toggleAddMarketBtn();
        
        btn.disabled = false;
        btnText.textContent = 'Guardar Apuesta';
        
        console.log('🔄 Llamando a loadRecentBets desde callback');
        showMessage('✅ Apuesta guardada y sincronizada', 'success');
        loadRecentBets();
    });
}

// ===== FIRESTORE FUNCTIONS =====

async function saveBetToFirestore(bet, allBets, callback) {
    try {
        updateSyncStatus('syncing');
        console.log('📤 Guardando en Firestore...');
        console.log('📊 Total de apuestas a guardar:', allBets.length);
        
        // Intentar obtener el UID de la app web
        let userId = localStorage.getItem('firestore_user_uid');
        
        if (userId) {
            console.log('🔑 UID de usuario encontrado:', userId);
            // Guardar en el documento del usuario autenticado
            const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/users/${userId}?key=${FIREBASE_CONFIG.apiKey}`;
            
            const payload = {
                fields: {
                    extensionBets: {
                        arrayValue: {
                            values: allBets.map(b => ({
                                mapValue: {
                                    fields: {
                                        id: { stringValue: String(b.id) },
                                        type: { stringValue: b.type || 'simple' },
                                        house: { stringValue: b.house || '' },
                                        sport: { stringValue: b.sport || '' },
                                        event: { stringValue: b.event || '' },
                                        odds: { doubleValue: parseFloat(b.odds) || 0 },
                                        stake: { doubleValue: parseFloat(b.stake) || 0 },
                                        status: { stringValue: b.status || 'pending' },
                                        date: { stringValue: b.date || '' },
                                        createdAt: { stringValue: b.createdAt || '' },
                                        markets: {
                                            arrayValue: {
                                                values: (Array.isArray(b.markets) ? b.markets : [b.market || '']).map(m => ({ stringValue: m }))
                                            }
                                        }
                                    }
                                }
                            }))
                        }
                    },
                    lastSyncExtension: { stringValue: new Date().toISOString() }
                }
            };
            
            console.log('🌐 URL:', url);
            
            const response = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            console.log('📡 Respuesta de Firestore:', response.status, response.statusText);
            
            if (response.ok) {
                console.log('✅ Guardado en Firestore exitosamente (documento del usuario)');
                updateSyncStatus('ready');
                if (callback) {
                    console.log('🔔 Ejecutando callback después de guardar en Firestore');
                    callback();
                }
            } else {
                const error = await response.text();
                console.error('❌ Error en Firestore:', response.status, error);
                updateSyncStatus('offline');
                if (callback) {
                    console.log('🔔 Ejecutando callback (aunque hubo error)');
                    callback();
                }
            }
        } else {
            console.log('⚠️ No se encontró UID de usuario. Guardando en extension_users como fallback');
            // Fallback a extension_users si no hay autenticación
            const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/extension_users/${EXTENSION_USER_ID}?key=${FIREBASE_CONFIG.apiKey}`;
            
            const payload = {
                fields: {
                    bets: {
                        arrayValue: {
                            values: allBets.map(b => ({
                                mapValue: {
                                    fields: {
                                        id: { stringValue: String(b.id) },
                                        type: { stringValue: b.type || 'simple' },
                                        house: { stringValue: b.house || '' },
                                        sport: { stringValue: b.sport || '' },
                                        event: { stringValue: b.event || '' },
                                        odds: { doubleValue: parseFloat(b.odds) || 0 },
                                        stake: { doubleValue: parseFloat(b.stake) || 0 },
                                        status: { stringValue: b.status || 'pending' },
                                        date: { stringValue: b.date || '' },
                                        createdAt: { stringValue: b.createdAt || '' },
                                        markets: {
                                            arrayValue: {
                                                values: (Array.isArray(b.markets) ? b.markets : [b.market || '']).map(m => ({ stringValue: m }))
                                            }
                                        }
                                    }
                                }
                            }))
                        }
                    },
                    lastSync: { stringValue: new Date().toISOString() }
                }
            };
            
            const response = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                console.log('✅ Guardado en extension_users'),
                updateSyncStatus('ready');
                if (callback) callback();
            } else {
                updateSyncStatus('offline');
                if (callback) callback();
            }
        }
    } catch (error) {
        console.error('❌ Error guardando en Firestore:', error);
        updateSyncStatus('offline');
        if (callback) {
            console.log('🔔 Ejecutando callback (error de red)');
            callback();
        }
    }
}

function loadRecentBets() {
    console.log('📋 Cargando apuestas recientes...');
    const betsJson = sessionStorage.getItem('bets');
    console.log('📦 JSON de bets en sesión:', betsJson);
    
    const bets = JSON.parse(betsJson || '[]');
    console.log('✅ Bets parseadas:', bets.length, 'apuestas totales');
    
    const recentBets = bets.slice(-5).reverse();
    console.log('📊 Mostrando últimas 5:', recentBets.length);
    
    const betsList = document.getElementById('betsList');
    console.log('🎯 betsList elemento encontrado:', !!betsList);
    
    if (!betsList) {
        console.error('❌ Elemento betsList no encontrado');
        return;
    }
    
    betsList.innerHTML = '';
    
    if (recentBets.length === 0) {
        console.log('ℹ️ No hay apuestas para mostrar');
        betsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">Aún no hay apuestas</p>';
        return;
    }
        
        console.log('📊 Renderizando', recentBets.length, 'apuestas recientes');
        recentBets.forEach((bet, index) => {
            console.log(`  [${index + 1}]`, bet.event, bet.odds, '€' + bet.stake);
            const betEl = document.createElement('div');
            betEl.className = 'bet-item';
            
            const statusClass = bet.status === 'win' ? 'win' : (bet.status === 'loss' ? 'loss' : 'pending');
            const statusText = bet.status === 'win' ? 'Ganada' : (bet.status === 'loss' ? 'Perdida' : 'Pendiente');
            
            let marketInfo = '';
            if (Array.isArray(bet.markets) && bet.markets.length > 1) {
                marketInfo = `<span class="badge-combined">+${bet.markets.length - 1}</span> ${bet.markets[0]}`;
            } else {
                marketInfo = bet.market || bet.markets?.[0] || 'N/A';
            }
            
            betEl.innerHTML = `
                <div class="bet-item-info">
                    <div class="bet-item-event">${bet.event}</div>
                    <div class="bet-item-details">${bet.house} • ${bet.odds} • €${bet.stake}</div>
                    <div class="bet-item-market" style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">${marketInfo}</div>
                </div>
                <div class="bet-item-status ${statusClass}">${statusText}</div>
            `;
            
            betsList.appendChild(betEl);
        });
}

function updateSyncStatus(status) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    if (!statusDot || !statusText) return;
    
    statusDot.className = 'status-dot';
    
    switch(status) {
        case 'ready':
            statusDot.classList.add('status-dot');
            statusText.textContent = 'Sincronizado';
            break;
        case 'syncing':
            statusDot.classList.add('syncing');
            statusText.textContent = 'Sincronizando...';
            break;
        case 'offline':
            statusDot.classList.add('error');
            statusText.textContent = 'Sin conexión';
            break;
    }
}

function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    if (!messageEl) {
        console.log(`[${type.toUpperCase()}] ${text}`);
        return;
    }
    
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    
    setTimeout(() => {
        if (messageEl) messageEl.className = 'message';
    }, 3000);
}
