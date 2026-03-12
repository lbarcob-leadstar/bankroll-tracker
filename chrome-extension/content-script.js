// Content Script - Se inyecta en localhost:8000
// Permite que la extensión escriba en localStorage de la página

console.log('✅ Content script cargado en:', window.location.hostname);

// Escuchar mensajes de la extensión (desde background.js)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Mensaje recibido desde extensión:', request.type);
    
    if (request.type === 'SYNC_BETS') {
        try {
            // Escribir bets en localStorage de la página web
            const bets = request.bets || [];
            console.log('💾 Escribiendo', bets.length, 'apuestas en localStorage...');
            
            localStorage.setItem('bets', JSON.stringify(bets));
            console.log('✅ Apuestas escritas en localStorage');
            
            // Disparar evento para que la app se entere del cambio
            window.dispatchEvent(new CustomEvent('bets-updated', { detail: bets }));
            console.log('🔔 Evento "bets-updated" disparado');
            
            sendResponse({ success: true, count: bets.length });
        } catch (error) {
            console.error('❌ Error sincronizando:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
    
    if (request.type === 'GET_BETS') {
        try {
            const bets = JSON.parse(localStorage.getItem('bets') || '[]');
            console.log('📤 Devolviendo', bets.length, 'apuestas');
            sendResponse({ success: true, bets });
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }
});

console.log('🔗 Content script listo para sincronizar');
console.log('🎯 Esperando mensajes en:', window.location.href);
