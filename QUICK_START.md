# 🎯 Quick Start - Pasos Rápidos

## 1️⃣ Configurar Supabase (10 minutos)

```bash
# No requiere código - solo web browser
1. Ve a https://supabase.com
2. Crea una cuenta con GitHub
3. Crea un proyecto nuevo
4. En Settings → API, copia:
   - Project URL
   - anon public key
5. SQL Editor → Ejecuta el SQL desde MIGRATION_GUIDE.md
6. Habilita Email provider en Authentication
```

## 2️⃣ Actualizar `.env.local` (1 minuto)

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=development
```

## 3️⃣ Instalar dependencias (2 minutos)

```bash
cd /Users/luis/Documents/bankroll-tracker
npm install
```

## 4️⃣ Actualizar `public/index.html` (30 minutos)

### Sección de scripts al final antes de `</body>`

**REMOVER ESTAS LÍNEAS:**
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

**AGREGAR ESTAS LÍNEAS:**
```html
<!-- Supabase Client -->
<script src="supabase-client.js"></script>

<!-- Supabase Auth Module -->
<script src="supabase-auth.js"></script>

<!-- Supabase Data Service -->
<script src="supabase-data.js"></script>

<!-- Tesseract.js para OCR (MANTENER) -->
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/tesseract.min.js"></script>

<!-- ORIGINAL APP SCRIPT -->
<script>
    // Tu código de app aquí
    // ...cambios necesarios abajo...
</script>
```

## 5️⃣ Cambios en el código de `index.html`

### Cambio 1: Función `loadBets()` (alrededor de línea 3230)

**ANTES:**
```javascript
loadBets() {
    const saved = localStorage.getItem('bets');
    const storedUserId = localStorage.getItem('currentUserId');
    
    if (saved && storedUserId === currentUserId) {
        return JSON.parse(saved);
    }
    return [];
}
```

**DESPUÉS:**
```javascript
loadBets() {
    // Cargar desde localStorage (backup local)
    const saved = localStorage.getItem('bets');
    const storedUserId = localStorage.getItem('currentUserId');
    const currentUserId = authManager.getCurrentUser()?.id;
    
    if (saved && storedUserId === currentUserId) {
        return JSON.parse(saved);
    }
    
    // En background, sincronizar desde Supabase
    if (currentUserId) {
        dataService.getBets(currentUserId).then(result => {
            if (result.success && result.data?.length > 0) {
                this.bets = result.data;
                localStorage.setItem('bets', JSON.stringify(this.bets));
                this.render();
            }
        });
    }
    
    return [];
}
```

### Cambio 2: Función de guardar apuesta (busca `localStorage.setItem('bets')`)

Reemplaza TODAS las ocurrencias de:
```javascript
localStorage.setItem('bets', JSON.stringify(this.bets));
```

Con:
```javascript
// Guardar localmente
localStorage.setItem('bets', JSON.stringify(this.bets));

// Guardar en Supabase (non-blocking)
const userId = authManager.getCurrentUser()?.id;
if (userId && this.bets.length > 0) {
    const latestBet = this.bets[this.bets.length - 1];
    dataService.createBet(userId, {
        bet_type: latestBet.type || 'simple',
        house: latestBet.house,
        sport: latestBet.sport,
        event: latestBet.event,
        market: latestBet.market,
        odds: latestBet.odds,
        stake: latestBet.stake,
        status: latestBet.status,
        notes: latestBet.notes || '',
        bet_date: latestBet.date
    }).catch(err => console.error('Error saving to Supabase:', err));
}
```

### Cambio 3: Función `resetAllData()` (búscala)

**ANTES:**
```javascript
function resetAllData() {
    if (confirm('⚠️ Seguro que quieres borrar TODOS los datos?')) {
        localStorage.removeItem('bets');
        localStorage.removeItem('initialBankroll');
        location.reload();
    }
}
```

**DESPUÉS:**
```javascript
async function resetAllData() {
    if (confirm('⚠️ Seguro que quieres borrar TODOS los datos?')) {
        const userId = authManager.getCurrentUser()?.id;
        
        // Borrar de Supabase
        if (userId) {
            const result = await dataService.getBets(userId);
            if (result.success) {
                for (const bet of result.data) {
                    await dataService.deleteBet(bet.id);
                }
            }
        }
        
        // Borrar de localStorage
        localStorage.removeItem('bets');
        localStorage.removeItem('initialBankroll');
        localStorage.removeItem('firestore_user_uid');
        localStorage.removeItem('currentUserId');
        
        location.reload();
    }
}
```

### Cambio 4: Función `resetBankroll()` (búscala)

**ANTES:**
```javascript
function resetBankroll() {
    const newBankroll = prompt('Nueva banca inicial:');
    if (newBankroll !== null) {
        localStorage.setItem('initialBankroll', newBankroll);
        tracker.initialBankroll = parseFloat(newBankroll);
        tracker.render();
    }
}
```

**DESPUÉS:**
```javascript
async function resetBankroll() {
    const newBankroll = prompt('Nueva banca inicial:');
    if (newBankroll !== null) {
        const userId = authManager.getCurrentUser()?.id;
        
        // Guardar en Supabase
        if (userId) {
            await dataService.setInitialBankroll(userId, parseFloat(newBankroll));
        }
        
        // Guardar localmente
        localStorage.setItem('initialBankroll', newBankroll);
        tracker.initialBankroll = parseFloat(newBankroll);
        tracker.render();
    }
}
```

## 6️⃣ Probar localmente (5 minutos)

```bash
npm run dev
```

Abre `http://localhost:3000` y prueba:
- ✅ Registro con email
- ✅ Login con email
- ✅ Agregar apuesta
- ✅ Ver apuestas
- ✅ Logout

## 7️⃣ Desplegar a Vercel (15 minutos)

```bash
# Crear repo en GitHub si no existe
git init
git add .
git commit -m "feat: migrate to Vercel + Supabase"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/bankroll-tracker.git
git push -u origin main
```

Luego:
1. Ve a https://vercel.com
2. Clic en "New Project"
3. Conecta tu repositorio `bankroll-tracker`
4. Agrega variables de entorno:
   ```
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   ```
5. Clic en "Deploy"
6. ✨ ¡Listo!

## 📊 Checklist Final

- [ ] Supabase proyecto creado
- [ ] Tablas SQL creadas
- [ ] `.env.local` actualizado
- [ ] Scripts de Firebase removidos
- [ ] Scripts de Supabase agregados
- [ ] `loadBets()` actualizado
- [ ] Funciones de guardar actualizadas
- [ ] `resetAllData()` actualizado
- [ ] `resetBankroll()` actualizado
- [ ] Probado localmente en http://localhost:3000
- [ ] Repositorio GitHub creado
- [ ] Repositorio pusheado a GitHub
- [ ] Proyecto Vercel creado
- [ ] Deploy completado
- [ ] App funciona en tu URL de Vercel ✨

---

## 🆘 Errores comunes

### "Cannot read property 'id' of undefined"
→ Espera a que `authManager` se inicialice. Agrega:
```javascript
Promise.resolve(authManager.init()).then(() => {
    // Tu código aquí
});
```

### "SUPABASE_URL is undefined"
→ Falta actualizar `.env.local` con tus credenciales de Supabase

### "Bets not saving"
→ Verifica que el usuario esté autenticado:
```javascript
const user = authManager.getCurrentUser();
console.log('Current user:', user);
```

### App vacía en Vercel
→ Verifica que SUPABASE_URL y SUPABASE_ANON_KEY estén en Vercel settings

---

**Tiempos estimados:**
- Pasos 1-3: 15 minutos
- Pasos 4-5: 30 minutos  
- Pasos 6-7: 30 minutos
- **Total: ~75 minutos** ⏱️

¡Te deseo éxito con la migración! 🚀
