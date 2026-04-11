# 🚀 Guía de Migración: Firebase → Supabase + Vercel

## 📋 Índice
1. [Configurar Supabase](#configurar-supabase)
2. [Crear Base de Datos](#crear-base-de-datos)
3. [Configurar Autenticación](#configurar-autenticación)
4. [Desplegrar en Vercel](#desplegar-en-vercel)
5. [Migrar Datos](#migrar-datos)

---

## 1. 🔧 Configurar Supabase

### Paso 1: Crear cuenta en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"** o **"Sign Up"**
3. Usa tu email o cuenta de GitHub
4. Confirma tu email

### Paso 2: Crear nuevo proyecto
1. En el dashboard, haz clic en **"New Project"**
2. Llena la información:
   - **Name**: `bankroll-tracker`
   - **Database Password**: Crea una contraseña segura (guárdala!)
   - **Region**: Elige la más cercana a ti (EU) o USA (East)
3. Haz clic en **"Create new project"**

⏳ Espera a que el proyecto se cree (5-10 minutos)

### Paso 3: Obtener las credenciales
1. Una vez creado el proyecto, ve a **Settings** → **API**
2. Copia:
   - **Project URL** → esto es tu `SUPABASE_URL`
   - **anon public** → esto es tu `SUPABASE_ANON_KEY`

Ejemplo:
```
SUPABASE_URL = https://abcdef.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. 📊 Crear Base de Datos

### Tablas necesarias:

**Tabla 1: `users`** (gestión de perfiles adicionales)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  initial_bankroll DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Tabla 2: `bets`** (apuestas)
```sql
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Información de la apuesta
  bet_type VARCHAR(20) DEFAULT 'simple', -- 'simple' o 'combined'
  house VARCHAR(100) NOT NULL,
  sport TEXT NOT NULL,
  event TEXT NOT NULL,
  market TEXT NOT NULL,
  additional_markets TEXT, -- JSON array para apuestas combinadas
  
  -- Datos numéricos
  odds DECIMAL(5, 2) NOT NULL,
  stake DECIMAL(10, 2) NOT NULL,
  stake_type VARCHAR(20) DEFAULT 'currency', -- 'currency' o 'percent'
  profit DECIMAL(10, 2),
  
  -- Estado
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'win', 'loss'
  
  -- Metadata
  notes TEXT,
  bet_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_odds CHECK (odds > 0),
  CONSTRAINT positive_stake CHECK (stake > 0)
);

-- Índices para mejor performance
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_bet_date ON bets(bet_date);
CREATE INDEX idx_bets_status ON bets(status);
```

### Crear las tablas:
1. En tu proyecto Supabase, ve a **SQL Editor**
2. Haz clic en **"New Query"**
3. Copia y pega cada CREATE TABLE
4. Haz clic en **"Run"** para cada uno

---

## 3. 🔐 Configurar Autenticación

### Habilitar Email/Password:
1. Ve a **Authentication** → **Providers**
2. Busca **Email** y asegúrate de que está **ON** (verde)
3. Desactiva **Email confirmations** por ahora (puedes activarlo después)

### Habilitar Google OAuth (opcional pero recomendado):
1. Ve a **Authentication** → **Providers** → **Google**
2. Haz clic en **Enable**
3. Ve a [Google Cloud Console](https://console.cloud.google.com)
4. Crea un nuevo proyecto o usa uno existente
5. Activa la API de Google
6. Ve a **Credentials** → **Create Credentials** → **OAuth Client ID**
7. Selecciona **Web Application**
8. Añade estas URIs autorizados:
   ```
   http://localhost:3000
   https://tu-proyecto.vercel.app
   ```
9. Copia el **Client ID** y **Client Secret**
10. Vuelve a Supabase y pega los datos en Google provider

---

## 4. 🌐 Desplegar en Vercel

### Paso 1: Preparar el proyecto
```bash
cd /Users/luis/Documents/bankroll-tracker

# Instalar dependencias
npm install
```

### Paso 2: Crear cuenta en Vercel
1. Ve a [https://vercel.com](https://vercel.com)
2. Haz login con GitHub
3. Haz clic en **"New Project"**

### Paso 3: Conectar repositorio
1. Autoriza Vercel a acceder a tu GitHub
2. Selecciona el repositorio `bankroll-tracker`
3. Haz clic en **"Import"**

### Paso 4: Configurar variables de entorno
1. En Vercel, ve a **Settings** → **Environment Variables**
2. Añade:
   ```
   SUPABASE_URL = tu_url_de_supabase
   SUPABASE_ANON_KEY = tu_anon_key
   ```
3. Haz clic en **"Save"**

### Paso 5: Deploy
1. Haz clic en **"Deploy"**
2. Espera a que se complete (2-5 minutos)
3. ¡Tu app está en vivo en `https://your-project.vercel.app`!

---

## 5. 📦 Migrar Datos

### Si ya tienes datos en Firebase/localStorage:

**Opción A: Exportar y copiar manualmente**
1. Abre DevTools en tu navegador (F12)
2. Ve a **Console**
3. Pega este código:
```javascript
// Copiar los datos a compartir
const bets = JSON.parse(localStorage.getItem('bets') || '[]');
const initialBankroll = localStorage.getItem('initialBankroll');
console.log(JSON.stringify({ bets, initialBankroll }, null, 2));
// Copia la salida
```

**Opción B: Script de migración**
Pronto crearemos un script automático para migrar datos. Por ahora, como no tienes usuarios, puedes empezar con la base de datos vacía.

---

## ✅ Checklist Final

- [ ] Cuenta en Supabase creada
- [ ] Proyecto de Supabase creado
- [ ] Tablas de base de datos creadas
- [ ] Credenciales de Supabase guardadas
- [ ] Autenticación configurada en Supabase
- [ ] Repositorio en GitHub
- [ ] Proyecto en Vercel creado
- [ ] Variables de entorno en Vercel
- [ ] Deploy completado exitosamente
- [ ] App funcionando en Vercel

---

## 🆘 Problemas comunes

**"Connection refused"**
→ Verifica que SUPABASE_URL y SUPABASE_ANON_KEY sean correctos

**"CORS error"**
→ Asegúrate de que los dominios están en CORS settings de Supabase

**"Auth not working"**
→ Check que Email provider esté habilitado en Supabase

---

## 📞 Próximos pasos

1. Completar la guía de Supabase
2. Actualizar el código de autenticación  
3. Migrar los endpoints de datos
4. Probar todo localmente
5. Desplegar a Vercel

¡Contacta si necesitas ayuda! 🚀
