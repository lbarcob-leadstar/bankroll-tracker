// Extensión Chrome - Sincronización con Supabase
const SUPABASE_URL = 'https://mohjjzxkmwypocuenahv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaGpqenhrbXd5cG9jdWVuYWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjQ5NDMsImV4cCI6MjA5MTQ0MDk0M30.eTs4gchQMf_M0bAnms9GkoQQeqrCHhp4A_LUtK-w9Wk';

let betType = 'simple';

// ===== GESTIÓN DE SESIÓN (chrome.storage.local, persiste entre aperturas) =====

async function getSession() {
    const result = await chrome.storage.local.get(['supabase_session']);
    return result.supabase_session || null;
}

async function setSession(session) {
    await chrome.storage.local.set({ supabase_session: session });
}

async function clearSession() {
    await chrome.storage.local.remove(['supabase_session']);
}

async function getValidToken() {
    const session = await getSession();
    if (!session || !session.access_token) return null;

    // Refrescar si expira en menos de 5 minutos
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at - now < 300) {
        const refreshed = await refreshToken(session.refresh_token);
        return refreshed ? refreshed.access_token : null;
    }
    return session.access_token;
}

async function refreshToken(refresh_token) {
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
            body: JSON.stringify({ refresh_token })
        });
        if (!response.ok) { await clearSession(); return null; }
        const data = await response.json();
        const session = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
            user_id: data.user.id,
            email: data.user.email
        };
        await setSession(session);
        return session;
    } catch { await clearSession(); return null; }
}

// ===== AUTENTICACIÓN SUPABASE =====

async function loginSupabase(email, password) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error_description || err.msg || 'Credenciales incorrectas');
    }
    const data = await response.json();
    const session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
        user_id: data.user.id,
        email: data.user.email
    };
    await setSession(session);
    return session;
}

async function logoutSupabase() {
    const token = await getValidToken();
    if (token) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY }
        }).catch(() => {});
    }
    await clearSession();
}

// ===== UI HELPERS =====

async function checkSession() {
    const session = await getSession();
    return !!(session && session.access_token);
}

async function updateUI() {
    const loginScreen = document.getElementById('loginScreen');
    const mainScreen = document.getElementById('mainScreen');
    const hasSession = await checkSession();

    if (hasSession) {
        loginScreen.style.display = 'none';
        mainScreen.style.display = 'block';
    } else {
        loginScreen.style.display = 'flex';
        mainScreen.style.display = 'none';
    }
    return hasSession;
}

// Manejar clics en el botón de logout globalmente
document.addEventListener('click', (e) => {
    if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('¿Cerrar sesión?')) {
            logout();
        }
    }
}, true);

document.addEventListener('DOMContentLoaded', async () => {
    // Configurar el formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const message = document.getElementById('loginMessage');
            const btn = loginForm.querySelector('button[type="submit"]');

            if (!email || !password) {
                message.textContent = 'Completa email y contraseña';
                message.className = 'login-message error';
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Iniciando sesión...';
            message.textContent = '';

            try {
                const session = await loginSupabase(email, password);
                message.textContent = `✅ Bienvenido, ${session.email.split('@')[0]}`;
                message.className = 'login-message success';
                loginForm.reset();

                setTimeout(async () => {
                    await updateUI();
                    initializeDateTodayinForm();
                    setupBetTypeSelector();
                    setupAddMarketButton();
                    await loadRecentBets();
                    updateSyncStatus('ready');
                    document.getElementById('betForm').addEventListener('submit', handleFormSubmit);
                }, 400);
            } catch (err) {
                message.textContent = `❌ ${err.message}`;
                message.className = 'login-message error';
                btn.disabled = false;
                btn.textContent = 'Iniciar Sesión';
            }
        });
    }

    // Verificar si hay sesión activa
    const hasSession = await updateUI();

    if (hasSession) {
        initializeDateTodayinForm();
        setupBetTypeSelector();
        setupAddMarketButton();
        await loadRecentBets();
        updateSyncStatus('ready');

        const betForm = document.getElementById('betForm');
        if (betForm) {
            betForm.addEventListener('submit', handleFormSubmit);
        }
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

async function logout() {
    await logoutSupabase();

    const loginScreen = document.getElementById('loginScreen');
    const mainScreen = document.getElementById('mainScreen');
    loginScreen.style.display = 'flex';
    mainScreen.style.display = 'none';

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.reset();
        document.getElementById('loginEmail').focus();
    }

    const message = document.getElementById('loginMessage');
    message.textContent = '👋 Sesión cerrada. Vuelve a iniciar sesión.';
    message.className = 'login-message success';
    setTimeout(() => { message.textContent = ''; }, 3000);
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

async function handleFormSubmit(event) {
    event.preventDefault();

    const btnText = document.getElementById('btnText');
    const btn = document.getElementById('saveBetBtn');
    btn.disabled = true;
    btnText.textContent = 'Guardando...';

    const markets = collectMarkets();
    if (markets.length === 0) {
        showMessage('Debes especificar al menos un mercado', 'error');
        btn.disabled = false;
        btnText.textContent = 'Guardar Apuesta';
        return;
    }

    const bet = {
        type: betType,
        house: document.getElementById('house').value,
        sport: document.getElementById('sport').value,
        event: document.getElementById('event').value,
        markets: markets,
        market: markets.length === 1 ? markets[0] : markets,
        odds: parseFloat(document.getElementById('odds').value),
        stake: parseFloat(document.getElementById('stake').value),
        status: document.getElementById('status').value,
        date: document.getElementById('date').value,
    };

    updateSyncStatus('syncing');
    const ok = await saveBetToSupabase(bet);

    if (ok) {
        // Reset form
        document.getElementById('betForm').reset();
        initializeDateTodayinForm();
        document.querySelectorAll('.bet-type-option').forEach(o => o.classList.remove('active'));
        document.querySelector('.bet-type-option[data-type="simple"]').classList.add('active');
        betType = 'simple';
        document.getElementById('additionalMarketsContainer').innerHTML = '';
        toggleAddMarketBtn();
        showMessage('✅ Apuesta guardada y sincronizada', 'success');
        updateSyncStatus('ready');
        await loadRecentBets();
    } else {
        showMessage('❌ Error al guardar. Comprueba tu conexión.', 'error');
        updateSyncStatus('offline');
    }

    btn.disabled = false;
    btnText.textContent = 'Guardar Apuesta';
}

// ===== SUPABASE DATA FUNCTIONS =====

async function saveBetToSupabase(bet) {
    try {
        const token = await getValidToken();
        if (!token) { updateSyncStatus('offline'); return false; }

        const session = await getSession();
        const markets = Array.isArray(bet.markets) ? bet.markets : (bet.market ? [bet.market] : []);

        const betData = {
            user_id: session.user_id,
            bet_type: bet.type || 'simple',
            house: bet.house || '',
            sport: bet.sport || '',
            event: bet.event || '',
            market: markets.join(' | ') || '',
            odds: parseFloat(bet.odds) || 0,
            stake: parseFloat(bet.stake) || 0,
            stake_type: 'currency',
            profit: 0,
            status: bet.status || 'pending',
            notes: '',
            bet_date: bet.date || new Date().toISOString().split('T')[0]
        };

        const response = await fetch(`${SUPABASE_URL}/rest/v1/bets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'apikey': SUPABASE_ANON_KEY,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(betData)
        });

        return response.ok || response.status === 201;
    } catch (err) {
        console.error('Error guardando apuesta:', err);
        return false;
    }
}

async function loadRecentBets() {
    const betsList = document.getElementById('betsList');
    if (!betsList) return;

    betsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">Cargando...</p>';

    try {
        const token = await getValidToken();
        if (!token) {
            betsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">Sesión expirada</p>';
            return;
        }

        const session = await getSession();
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/bets?user_id=eq.${session.user_id}&order=bet_date.desc,created_at.desc&limit=5`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': SUPABASE_ANON_KEY
                }
            }
        );

        if (!response.ok) {
            betsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">Error al cargar apuestas</p>';
            return;
        }

        const bets = await response.json();
        betsList.innerHTML = '';

        if (bets.length === 0) {
            betsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">Aún no hay apuestas</p>';
            return;
        }

        bets.forEach(bet => {
            const betEl = document.createElement('div');
            betEl.className = 'bet-item';

            const statusClass = bet.status === 'win' ? 'win' : (bet.status === 'loss' ? 'loss' : 'pending');
            const statusText = bet.status === 'win' ? 'Ganada' : (bet.status === 'loss' ? 'Perdida' : 'Pendiente');

            betEl.innerHTML = `
                <div class="bet-item-info">
                    <div class="bet-item-event">${bet.event}</div>
                    <div class="bet-item-details">${bet.house} • ${bet.odds} • €${bet.stake}</div>
                    <div class="bet-item-market" style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">${bet.market || ''}</div>
                </div>
                <div class="bet-item-status ${statusClass}">${statusText}</div>
            `;
            betsList.appendChild(betEl);
        });
    } catch (err) {
        console.error('Error cargando apuestas:', err);
        betsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">Error de conexión</p>';
    }
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
