# 🏗️ Arquitectura Nueva: Vercel + Supabase

## Comparación: Antes vs Después

### ❌ Arquitectura Anterior (Firebase)
```
┌─────────────────────────────────┐
│     Cliente (PWA en Browser)     │
│   - HTML/CSS/JavaScript          │
│   - localStorage para datos      │
│   - Firebase Auth                │
└────────────┬────────────────────┘
             │ HTTPS
      ┌──────▼──────┐
      │   Firebase  │
      │   - Auth    │
      │   - Firestore
      └─────────────┘
```

**Problemas:**
- ❌ localStorage es inseguro y limitado
- ❌ No hay sincronización entre dispositivos (en v actual)
- ❌ Difícil de escalar

---

### ✅ Arquitectura Nueva (Vercel + Supabase)
```
┌──────────────────────────────────────┐
│       Navegador del Usuario          │
│  ┌────────────────────────────────┐  │
│  │  Bankroll Tracker PWA (HTML)   │  │
│  │  - supabase-client.js          │  │
│  │  - supabase-auth.js            │  │
│  │  - supabase-data.js            │  │
│  │  - localStorage (cache local)  │  │
│  │  - Service Worker (offline)    │  │
│  └────────────────────────────────┘  │
└────────┬─────────────────────────────┘
         │ HTTPS API REST
    ┌────▼────────────────────┐
    │    VERCEL (Edge/Node)    │
    │  - api/index.js (Express)│
    │  - Servir archivos PWA   │
    │  - Auth routes (si hay)  │
    └────┬────────────────────┘
         │ PostgreSQL
    ┌────▼─────────────────────┐
    │   SUPABASE (PostgreSQL)   │
    │  ┌─────────────────────┐  │
    │  │ Auth (Database Users│  │
    │  ├─────────────────────┤  │
    │  │ Tables:             │  │
    │  │ - users             │  │
    │  │ - bets              │  │
    │  └─────────────────────┤  │
    │  - Backups automáticos │  │
    │  - Seguridad SSL/TLS   │  │
    │  - Row-Level Security  │  │
    └────────────────────────┘
```

**Ventajas:**
- ✅ datos seguros en PostgreSQL
- ✅ Sincronización automática multi-dispositivo
- ✅ Escalable sin límites
- ✅ Backups automáticos
- ✅ Funciona offline (Service Worker + localStorage)

---

## 📊 Stack Tecnológico

### Frontend
```javascript
// Supabase JavaScript Client
import { createClient } from '@supabase/supabase-js'

// Funciona online + offline
├── Online: Supabase (PostgreSQL)
└── Offline: localStorage + Service Worker
```

### Backend
```javascript
// Vercel (Node.js/Edge Runtime)
import express from 'express'
const app = express()

// Tareas:
├── Servir archivos PWA (index.html, CSS, JS)
├── Rutas API (/api/health, /api/config)
└── CORS headers
```

### Base de Datos
```sql
-- Supabase (PostgreSQL)
CREATE TABLE users (
  id UUID PRIMARY KEY,      -- Autenticación
  email TEXT,               -- Email del usuario
  initial_bankroll DECIMAL  -- Banca inicial
)

CREATE TABLE bets (
  id UUID PRIMARY KEY,
  user_id UUID FK,          -- Relación con usuarios
  house TEXT,               -- Bet365, Sportium, etc
  sport TEXT,               -- ⚽ Fútbol, 🏀 Basketball
  event TEXT,               -- Real Madrid vs Barcelona
  odds DECIMAL,             -- 1.95, 2.50, etc
  stake DECIMAL,            -- Dinero apostado
  profit DECIMAL,           -- Dinero ganado/perdido
  status VARCHAR,           -- pending, win, loss
  bet_date DATE,            -- Fecha de apuesta
  created_at TIMESTAMP      -- Timestamp de creación
)
```

---

## 🔄 Flujo de Datos

### 1. Registro de Usuario
```
Usuario escribe email/password
         ↓
   [Frontend] supabase-auth.js
         ↓
   Supabase Auth API
         ↓
   Crea usuario en auth.users
         ↓
   Backend crea record en tabla users
         ↓
   localStorage guarda sesión
         ↓
   ✅ Usuario autenticado
```

### 2. Agregar Apuesta
```
Usuario completa formulario
         ↓
   [Frontend] saveBet()
         ↓
   dataService.createBet(userId, betData)
         ↓
   Verifica autenticación
         ↓
   Sends POST a Supabase
         ↓
   PostgreSQL inserta en tabla bets
         ↓
   localStorage también guarda (backup)
         ↓
   ✅ Apuesta guardada (online + offline cache)
```

### 3. Cargar Apuestas
```
Usuario abre la app
         ↓
   [Frontend] loadBets()
         ↓
   Primero intenta localStorage (rápido)
         ↓
   Luego sincroniza desde Supabase
         ↓
   dataService.getBets(userId)
         ↓
   SELECT * FROM bets WHERE user_id = ?
         ↓
   Actualiza localStorage con datos frescos
         ↓
   ✅ Apuestas mostradas
```

---

## 🔐 Seguridad

### Row-Level Security (RLS)
```sql
-- Solo los usuarios ven sus propias apuestas
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own bets"
  ON bets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bets"
  ON bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Análisis de Riesgos
| Riesgo | Mitigación |
|--------|-----------|
| Datos expuestos en localStorage | ✅ Solo datos no-sensibles, se sincroniza a BD |
| CORS en Vercel | ✅ Configurado automáticamente |
| Contraseñas | ✅ Hashed en Supabase, HTTPS en tránsito |
| Acceso no autorizado | ✅ RLS + JWT tokens de Supabase |

---

## 📈 Escalabilidad

### Cantidad de usuarios
- Demo: 1 usuario (actual)
- Pequeño: 100 usuarios (localStorage funciona)
- Mediano: 1,000 usuarios (necesita Supabase) ✅
- Grande: 100,000+ usuarios (Supabase sigue funcionando) ✅

### Cantidad de apuestas
- 100 apuestas: 5-10 KB en localStorage ✅
- 1,000 apuestas: 100-200 KB en localStorage
- 10,000+ apuestas: 1-2 MB (necesita BD) 📦

Con Supabase, **ilimitado** 🚀

---

## 💾 Backups automáticos

Supabase proporciona:
- ✅ Backups diarios automáticos
- ✅ 7 días retenidos (plan free)
- ✅ Restauración de un punto en el tiempo
- ✅ Replicación en múltiples regiones (plan pro)

---

## 📱 Funcionalidad Offline

### Service Worker + localStorage
```javascript
// Service Worker captura requests
self.addEventListener('fetch', (event) => {
  // Si está online: fetch desde Supabase
  // Si está offline: serve desde cache
})

// App sincroniza automáticamente cuando vuelve online
window.addEventListener('online', () => {
  syncBetsWithSupabase()
})
```

---

## 🚀 Ventajas por use case

### Para desarrollo
- ✅ Fácil configuración (solo credenciales)
- ✅ Testing rápido
- ✅ Hot reload
- ✅ Logs en tiempo real

### Para usuarios
- ✅ Sincronización instantánea
- ✅ Acceso desde cualquier dispositivo
- ✅ Datos seguros en la nube
- ✅ 0 downtime

### Para escala
- ✅ Autoscaling automático
- ✅ CDN global (Vercel Edge)
- ✅ SQL avanzado disponible
- ✅ Extensiones PostgreSQL

---

## 💰 Costos

### Vercel (Hosting)
- Free: ✅ Suficiente para tu caso
- $20/mo: Pro con dominios custom
- Enterprise: Para millones de users

### Supabase (Base de datos)
- Free: ✅ 500 MB almacenamiento
- Pro: $25/mo → 100 GB
- Enterprise: Custom

**Tu caso:** Plans free suficientes 🎉

---

## 🎯 Resumen

| Aspecto | Antes (Firebase) | Después (Vercel+Supabase) |
|---------|------------------|--------------------------|
| Hosting | GitHub Pages | Vercel ✅ |
| BD | localStorage | PostgreSQL ✅ |
| Auth | Firebase | Supabase ✅ |
| Seguridad | Media | Alta ✅ |
| Sincronización | Manual | Automática ✅ |
| Escalabilidad | Limitada | Ilimitada ✅ |
| Costo | Free | Free ✅ |
| Performance | Bueno | Excelente ✅ |

---

**Status:** ✅ Arquitectura lista para implementar!
