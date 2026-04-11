# 🔄 Instrucciones para Migración de Scripts

## Cambios en `public/index.html`

### 1. Reemplazar los scripts de Firebase por Supabase

**ANTES (remover):**
```html
<!-- Firebase SDK v8 (Compatible) -->
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-analytics.js"></script>

<!-- Firebase Config -->
<script src="firebase-config.js"></script>

<!-- Auth Module -->
<script src="auth.js"></script>
```

**DESPUÉS (agregar):**
```html
<!-- Supabase Client -->
<script src="supabase-client.js"></script>

<!-- Supabase Auth Module -->
<script src="supabase-auth.js"></script>

<!-- Supabase Data Service -->
<script src="supabase-data.js"></script>
```

---

## Cambios en `public/index.html` - Lógica de la App

### Busca esta línea (alrededor de línea 3230):
```javascript
const saved = localStorage.getItem('bets');
const storedUserId = localStorage.getItem('currentUserId');
```

### Reemplázala con:
```javascript
// En lugar de localStorage, usar Supabase
const currentUserId = authManager.getCurrentUser()?.id;
if (!currentUserId) {
    console.warn('No authenticated user');
    return;
}

const betsResult = await dataService.getBets(currentUserId);
const saved = betsResult.success ? JSON.stringify(betsResult.data) : null;
const storedUserId = currentUserId;
```

---

## Cambios en funciones de guardado

### Busca y reemplaza las llamadas a `localStorage.setItem('bets', ...)`

**ANTES:**
```javascript
localStorage.setItem('bets', JSON.stringify(this.bets));
```

**DESPUÉS:**
```javascript
// Guardar en Supabase
const userId = authManager.getCurrentUser()?.id;
if (userId) {
    await dataService.createBet(userId, betData);
}
// Mantener localStorage como backup local
localStorage.setItem('bets', JSON.stringify(this.bets));
```

---

## Cambios en la clase BankrollTracker

### Método `loadBets()` - alrededor de línea 3230
**CAMBIAR:**
```javascript
loadBets() {
    const saved = localStorage.getItem('bets');
    return saved ? JSON.parse(saved) : [];
}
```

**POR:**
```javascript
async loadBets() {
    // Primero intentar cargar de Supabase
    const userId = authManager.getCurrentUser()?.id;
    if (userId) {
        const result = await dataService.getBets(userId);
        if (result.success) {
            this.bets = result.data;
            localStorage.setItem('bets', JSON.stringify(this.bets));
            return this.bets;
        }
    }
    
    // Fallback a localStorage
    const saved = localStorage.getItem('bets');
    return saved ? JSON.parse(saved) : [];
}
```

---

## Cambios en "Guardar Apuesta"

### En el formulario de apuestas (busca `saveBet()`)
**CAMBIAR DE:**
```javascript
saveBet() {
    // ... validaciones ...
    localStorage.setItem('bets', JSON.stringify(this.bets));
}
```

**POR:**
```javascript
async saveBet() {
    // ... validaciones ...
    
    const userId = authManager.getCurrentUser()?.id;
    if (userId) {
        // Guardar en Supabase primero
        const betData = {
            bet_type: this.betType,
            house: document.getElementById('betHouse').value,
            sport: document.getElementById('betSport').value,
            event: document.getElementById('betEvent').value,
            market: document.getElementById('betMarket').value,
            odds: parseFloat(document.getElementById('betOdds').value),
            stake: parseFloat(document.getElementById('betStake').value),
            status: document.getElementById('betStatus').value,
            notes: document.getElementById('betNotes').value,
            bet_date: document.getElementById('betDate').value,
            // ... otros campos
        };
        
        const result = await dataService.createBet(userId, betData);
        if (!result.success) {
            console.error('Error saving to Supabase:', result.error);
        }
    }
    
    // Mantener localStorage como backup
    localStorage.setItem('bets', JSON.stringify(this.bets));
}
```

---

## Cambios en Resetear Datos

### Busca `resetAllData()`
**CAMBIAR DE:**
```javascript
resetAllData() {
    localStorage.removeItem('bets');
    localStorage.removeItem('initialBankroll');
    // ...
}
```

**POR:**
```javascript
async resetAllData() {
    const userId = authManager.getCurrentUser()?.id;
    
    if (userId) {
        // Obtener todas las apuestas y eliminarlas de Supabase
        const result = await dataService.getBets(userId);
        if (result.success) {
            for (const bet of result.data) {
                await dataService.deleteBet(bet.id);
            }
        }
    }
    
    localStorage.removeItem('bets');
    localStorage.removeItem('initialBankroll');
    // ...
}
```

---

## Cambios en Exportar Datos

### Busca `exportDataAsCSV()`
**CAMBIAR DE:**
```javascript
function exportDataAsCSV() {
    const bets = JSON.parse(localStorage.getItem('bets') || '[]');
    // ...
}
```

**POR:**
```javascript
async function exportDataAsCSV() {
    const userId = authManager.getCurrentUser()?.id;
    if (!userId) return;
    
    const result = await dataService.exportToCSV(userId);
    if (result.success) {
        // Descargar CSV...
    }
}
```

---

## Orden correcto de cargar scripts en HTML

```html
<!-- Al final del <body> -->

<!-- Supabase -->
<script src="supabase-client.js"></script>
<script src="supabase-auth.js"></script>
<script src="supabase-data.js"></script>

<!-- Tesseract.js para OCR -->
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/tesseract.min.js"></script>

<!-- App principal -->
<script>
    // Inicializar Supabase antes de que la app cargue
    Promise.resolve(authManager.init()).then(() => {
        console.log('✅ Auth initialized');
        // Aquí va el resto del código de la app
    });
</script>
```

---

## ✅ Checklist de cambios

- [ ] Remover scripts de Firebase
- [ ] Agregar scripts de Supabase
- [ ] Actualizar `loadBets()` a async
- [ ] Actualizar `saveBet()` a async
- [ ] Actualizar `resetAllData()` a async
- [ ] Actualizar `exportDataAsCSV()` a async
- [ ] Cambiar `localStorage.setItem('bets')` por `dataService.createBet()`
- [ ] Cambiar `localStorage.setItem('initialBankroll')` por `dataService.setInitialBankroll()`
- [ ] Testear login/registro
- [ ] Testear guardar apuestas
- [ ] Testear cargar datos

---

**Nota:** Estamos manteniendo `localStorage` como backup local para mejor UX offline.
