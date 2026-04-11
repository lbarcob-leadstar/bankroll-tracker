# 🚀 Bankroll Tracker - Migración Vercel + Supabase
## Resumen Ejecutivo

¡Hola Luis! He preparado todo para migrar tu proyecto a **Vercel + Supabase**. Aquí está el plan paso a paso.

---

## 📊 Estado Actual
✅ **Completado:**
- [x] Creado `package.json` para Node.js
- [x] Creado `vercel.json` para configuración de Vercel
- [x] Creado `api/index.js` - Servidor Express
- [x] Creado `public/supabase-client.js` - Cliente Supabase
- [x] Creado `public/supabase-auth.js` - Autenticación Supabase
- [x] Creado `public/supabase-data.js` - Operaciones de datos
- [x] Documentación completa de migración

**Próximo:** Configurar Supabase y actualizar el código

---

## 🎯 Próximos Pasos (En orden)

### **PASO 1: Crear cuenta en Supabase** ⏱️ 5 minutos
1. Ve a https://supabase.com
2. Haz clic en **"Start your project"**
3. Registrarse con GitHub o email
4. Confirma tu email

### **PASO 2: Crear Proyecto en Supabase** ⏱️ 5-10 minutos
1. Dashboard de Supabase
2. Clic en **"New Project"**
3. **Name:** `bankroll-tracker`
4. **Database Password:** Crea una segura (guárdala!)
5. **Region:** EU (Europa) o USA (depending on location)
6. Clic en **"Create new project"**
⏳ **Espera 5-10 minutos a que se cree**

### **PASO 3: Copiar Credenciales de Supabase** ⏱️ 2 minutos
1. En dashboard → **Settings** → **API**
2. Copia:
   - `Project URL` = **SUPABASE_URL**
   - `anon public` = **SUPABASE_ANON_KEY**

### **PASO 4: Crear Tablas en Supabase** ⏱️ 5 minutos

En tu proyecto Supabase:
1. Ve a **SQL Editor**
2. Clic en **"New Query"**
3. Copia y ejecuta este SQL:

```sql
-- Tabla users (perfiles de usuario)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  initial_bankroll DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla bets (apuestas)
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Información de la apuesta
  bet_type VARCHAR(20) DEFAULT 'simple',
  house VARCHAR(100) NOT NULL,
  sport TEXT NOT NULL,
  event TEXT NOT NULL,
  market TEXT NOT NULL,
  additional_markets TEXT,
  
  -- Datos numéricos
  odds DECIMAL(5, 2) NOT NULL,
  stake DECIMAL(10, 2) NOT NULL,
  stake_type VARCHAR(20) DEFAULT 'currency',
  profit DECIMAL(10, 2),
  
  -- Estado
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Metadata
  notes TEXT,
  bet_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_odds CHECK (odds > 0),
  CONSTRAINT positive_stake CHECK (stake > 0)
);

-- Índices
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_bet_date ON bets(bet_date);
CREATE INDEX idx_bets_status ON bets(status);
```

### **PASO 5: Configurar Autenticación en Supabase** ⏱️ 5 minutos

#### Email (Obligatorio)
1. Ve a **Authentication** → **Providers**
2. Busca **Email** → asegúrate de que esté **ON** (verde)
3. Desactiva "Email confirmations" por ahora (opcional)

#### Google OAuth (Opcional pero recomendado)
Si quieres mantener login con Google como en tu proyecto anterior:

1. En **Authentication** → **Providers**, busca **Google**
2. Haz clic en **Google** para expandir
3. Activa el switch (si está en OFF)
4. Necesitarás Google Client ID y Client Secret:
   - Ve a [Google Cloud Console](https://console.cloud.google.com)
   - Crear nuevo proyecto o usa uno existente
   - Ve a **APIs & Services** → **Credentials**
   - Clic en **Create Credentials** → **OAuth Client ID**
   - Selecciona **Web Application**
   - En "Authorized redirect URIs" agrega:
     ```
     https://mohjjzxkmwypocuenahv.supabase.co/auth/v1/callback
     ```
   - Copia el **Client ID** y **Client Secret**
5. Vuelve a Supabase y pega los datos en el formulario de Google
6. Clic en **Save**

**NOTA:** También necesitarás agregar los dominios donde funciona tu app:
- Verificación del dominio → Agrega tu dominio de Vercel cuando despliegues

### **PASO 6: Actualizar archivo `.env.local`** ⏱️ 2 minutos

Reemplaza el contenido con tus credenciales:
```
SUPABASE_URL=https://xxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=development
```

### **PASO 7: Preparar el Código** ⏱️ 10 minutos

Lee los archivos:
- `MIGRATION_GUIDE.md` - Guía completa de migración
- `CHANGES_TO_APPLY.md` - Cambios específicos en `index.html`

**Cambios clave:**
1. Reemplaza scripts de Firebase por scripts de Supabase en `public/index.html`
2. Actualiza funciones que usan `localStorage` para usar `dataService`
3. Agrega `await` donde sea necesario (async/await)

### **PASO 8: Instalar Dependencias Locales** ⏱️ 2 minutos
```bash
cd /Users/luis/Documents/bankroll-tracker
npm install
```

### **PASO 9: Probar Localmente** ⏱️ 5 minutos
```bash
npm run dev
```

Visita `http://localhost:3000` en tu navegador

**Pruebas:**
- [ ] Registro de nuevo usuario
- [ ] Login con email
- [ ] Agregar una apuesta
- [ ] Ver apuestas guardadas
- [ ] Cerrar sesión

### **PASO 10: Crear Repositorio en GitHub** ⏱️ 5 minutos
1. Ve a https://github.com
2. Clic en **"+"** → **"New repository"**
3. **Name:** `bankroll-tracker`
4. **Public** (recomendado para Vercel free)
5. NO inicializar con README
6. Clic en **"Create repository"**

### **PASO 11: Subir código a GitHub** ⏱️ 5 minutos
```bash
cd /Users/luis/Documents/bankroll-tracker

git init
git add .
git commit -m "Initial commit with Supabase migration"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/bankroll-tracker.git
git push -u origin main
```

### **PASO 12: Desplegar en Vercel** ⏱️ 10 minutos

1. Ve a https://vercel.com
2. Haz login con GitHub
3. Clic en **"New Project"**
4. Autoriza Vercel
5. Selecciona **`bankroll-tracker`**
6. Clic en **"Import"**
7. **Environment Variables:**
   - `SUPABASE_URL` = tu URL
   - `SUPABASE_ANON_KEY` = tu anon key
8. Clic en **"Deploy"**
9. ✨ ¡Tu app está en vivo en `https://....vercel.app`!

---

## 📚 Archivos Creados

```
/api/
  ├── index.js              ← Servidor Express para Vercel
/public/
  ├── supabase-client.js    ← Inicializa cliente Supabase
  ├── supabase-auth.js      ← Autenticación (reemplaza Firebase)
  ├── supabase-data.js      ← Operaciones CRUD de datos
  └── index.html            ← Necesita actualizaciones
/
  ├── package.json          ← Dependencias Node.js
  ├── vercel.json           ← Configuración Vercel
  ├── .env.local            ← Variables de entorno (usa esto!)
  ├── MIGRATION_GUIDE.md    ← Guía detallada
  ├── CHANGES_TO_APPLY.md   ← Cambios en index.html
  └── README.md             ← Este archivo
```

---

## 🔧 Cambios Principales en `public/index.html`

### Remover:
```html
<!-- Firebase scripts (REMOVER) -->
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
<script src="firebase-config.js"></script>
<script src="auth.js"></script>
```

### Agregar:
```html
<!-- Supabase scripts (AGREGAR) -->
<script src="supabase-client.js"></script>
<script src="supabase-auth.js"></script>
<script src="supabase-data.js"></script>
```

### En las funciones JavaScript:
- Cambiar `localStorage.getItem('bets')` → `await dataService.getBets(userId)`
- Cambiar `localStorage.setItem('bets')` → `await dataService.createBet(userId, bet)`
- Cambiar `auth.signUp()` → `authManager.register(email, password)`

**Ver `CHANGES_TO_APPLY.md` para cambios línea por línea**

---

## ⚡ Ventajas de esta migración

✅ **Base de datos en la nube** - Datos sincronizados en cualquier dispositivo
✅ **PostgreSQL** - Mucho más sólido que localStorage
✅ **Hosting en Vercel** - Rápido, escalable, gratis
✅ **HTTPS** - Seguridad automática
✅ **Backups automáticos** - En Supabase
✅ **API REST** - Fácil de integrar
✅ **Sin limites de usuarios** - Crece cuando quieras

---

## 🆘 Si necesitas ayuda

1. **Supabase no crea el proyecto** → Intenta nuevamente o contacta soporte
2. **Error de CORS** → Asegúrate de que los dominios están autorizados
3. **Auth no funciona** → Verifica que Email provider esté habilitado
4. **Conexión rechazada** → Checa que SUPABASE_URL y SUPABASE_ANON_KEY sean correctos

---

## 📞 Próximos pasos después del deploy

1. **Google OAuth** (opcional) - Agregar login con Google
2. **Email confirmations** - Validar emails de usuarios
3. **Backups** - Configurar exportaciones automáticas
4. **Monitoreo** - Ver logs y errores en Vercel

---

## 🎯 Resumen timeline estimado
- Paso 1-6: **30 minutos** ⏱️
- Paso 7-9: **30 minutos** ⏱️
- Paso 10-12: **30 minutos** ⏱️
- **Total: ~1.5 horas** 🎉

¡Listo para empezar! 🚀
