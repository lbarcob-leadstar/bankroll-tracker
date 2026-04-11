// Service Worker para sincronización de fondo

console.log('🚀 Background service worker iniciado');

chrome.runtime.onInstalled.addListener(() => {
    console.log('✅ Extensión instalada/actualizada');
    // Habilitar el side panel para todas las pestañas
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Abrir sidebar cuando se hace click en el icono
chrome.action.onClicked.addListener((tab) => {
    if (chrome.sidePanel) {
        chrome.sidePanel.open({ tabId: tab.id });
    }
});
// ===== SINCRONIZACIÓN DE DATOS =====

// Cada vez que se guarda en Chrome Storage, sincronizar con pestañas abiertas
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.bets) {
        console.log('📤 Storage cambió, sincronizando...');
        
        const newBets = changes.bets.newValue || [];
        
        // Enviar a todas las pestañas de localhost:8000
        chrome.tabs.query(
            { url: ['http://localhost:8000/*', 'http://localhost:8001/*'] },
            (tabs) => {
                console.log('📨 Encontradas', tabs.length, 'pestañas para sincronizar');
                tabs.forEach((tab) => {
                    console.log('  → Enviando a:', tab.url);
                    chrome.tabs.sendMessage(
                        tab.id,
                        {
                            type: 'SYNC_BETS',
                            bets: newBets
                        },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                console.log('⚠️ Error enviando a tab:', chrome.runtime.lastError.message);
                            } else if (response?.success) {
                                console.log('✅ Sincronizado:', response.count, 'bets');
                            }
                        }
                    );
                });
            }
        );
    }
});

// Escuchar cuando se abre una pestaña de localhost
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && (tab.url?.includes('localhost:8000') || tab.url?.includes('localhost:8001'))) {
        console.log('🔗 Pestaña cargada:', tab.url);
        
        // Enviar bets guardadas al tab recién abierto
        chrome.storage.local.get(['bets'], (result) => {
            const bets = result.bets || [];
            if (bets.length > 0) {
                console.log('📤 Sincronizando', bets.length, 'bets a pestaña nueva');
                chrome.tabs.sendMessage(
                    tabId,
                    {
                        type: 'SYNC_BETS',
                        bets: bets
                    },
                    (response) => {
                        if (response?.success) {
                            console.log('✅ Sincronizadas', response.count, 'bets a tab nuevo');
                        }
                    }
                );
            }
        });
    }
});