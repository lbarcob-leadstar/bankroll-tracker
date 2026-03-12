# 🎯 Changelog - Extensión Chrome

## v1.1 - Sidebar Version (23 Feb 2026)

### ✨ Major Features Added

#### Side Panel Interface
- 🎉 Converted from popup to persistent sidebar
- ✅ Two-column layout (Form + Recent Bets)
- ✅ Chrome 114+ required for Side Panel API
- ✅ Always accessible without reopening
- ✅ Better use of screen space

#### File Changes
- **New**: `sidebar.html` - Optimized two-column layout
- **New**: `sidebar-styles.css` - Sidebar-specific styling
- **Updated**: `manifest.json` - Side panel configuration
- **Updated**: `background.js` - Click handler for sidebar
- **New**: `MIGRATION_GUIDE.md` - Transition documentation

#### Layout Improvements
- 50/50 split: Form on left, Recent Bets on right
- Compact header with sync status
- Better visual hierarchy
- Improved scrolling and overflow handling

---

## v1.0 - Initial Release

### Features

#### Selector de Tipo de Apuesta
- ✅ Opción **Simple**: Una única apuesta tradicional
- ✅ Opción **Combinada**: Múltiples eventos/mercados
- Selector visual con iconos (🎯 Simple | 📊 Combinada)
- Estilos glassmorphic que coinciden con la app principal

#### Mercados Múltiples en Apuestas Combinadas
- ✅ Botón **"+"** visible cuando se selecciona tipo "Combinada"
- ✅ Permitir añadir múltiples mercados/eventos
- ✅ Botón **"✕"** para eliminar mercados individuales
- ✅ Animación de entrada (`slideIn`) para nuevos campos
- Validación: requiere al menos un mercado

#### Almacenamiento Inteligente
- Apuestas simples: `market` es string
- Apuestas combinadas: `markets` es array + `market` para compatibilidad
- Campo `type` indica si es "simple" o "combined"

#### Visualización Mejorada en Recent Bets
- Badge `+N` para apuestas combinadas (ej: "+2" si tienen 3 mercados)
- Muestra primer mercado + cantidad adicional
- Ejemplo: `"+2 Gana Local"` para apuesta con 3 mercados

#### Reset Completo del Formulario
Después de guardar una apuesta:
- ✅ Limpia todos los mercados adicionales
- ✅ Resetea tipo de apuesta a "Simple"
- ✅ Limpia input de mercado
- ✅ Oculta botón "+" automáticamente

---

## 📝 Estructura de Datos

### Apuesta Simple
```json
{
  "id": "1708700400000",
  "type": "simple",
  "house": "Bet365",
  "sport": "⚽ Fútbol",
  "event": "Real Madrid vs Barcelona",
  "market": "Gana Local",
  "markets": ["Gana Local"],
  "odds": 2.5,
  "stake": 10,
  "status": "pending",
  "date": "2024-02-23",
  "createdAt": "2024-02-23T10:00:00Z",
  "synced": false
}
```

### Apuesta Combinada
```json
{
  "id": "1708700400001",
  "type": "combined",
  "house": "Betfair",
  "sport": "⚽ Fútbol",
  "event": "Champions League",
  "market": ["Gana Local", "Más de 2.5", "Ambos Marcan"],
  "markets": ["Gana Local", "Más de 2.5", "Ambos Marcan"],
  "odds": 8.75,
  "stake": 5,
  "status": "pending",
  "date": "2024-02-23",
  "createdAt": "2024-02-23T10:05:00Z",
  "synced": false
}
```

---

## 🎨 CSS Classes

### Nuevo en v1.0

```css
.bet-type-selector          /* Grid 2 columnas para opciones */
.bet-type-option            /* Estilo base de opción */
.bet-type-option.active     /* Opción seleccionada */
.bet-type-option .icon      /* Icono de opción */
.bet-type-option .label     /* Texto de opción */

.markets-container          /* Contenedor flex vertical */
.market-input-row           /* Fila con input + botón */
.add-market-btn             /* Botón + para añadir mercados */
.additional-market          /* Mercados adicionales */
.remove-market-btn          /* Botón ✕ para eliminar */

.badge-combined             /* Badge "+N" en lista */
```

### Nuevo en v1.1

```css
.content-wrapper            /* Grid 2 columnas sidebar */
.form-section               /* Columna izquierda */
.recent-section             /* Columna derecha */
```

---

## 🔧 Funciones JavaScript

### v1.0

- `collectMarkets()` - Recopila array de mercados
- `setupBetTypeSelector()` - Listeners de tipo
- `toggleAddMarketBtn()` - Muestra/oculta botón +
- `addMarketField()` - Crea nuevo input
- `removeMarketField()` - Elimina mercado
- `setupAddMarketButton()` - Listener del botón +

### v1.1

- `chrome.action.onClicked()` - Opens sidebar instead of popup

---

## 📊 Cambios CSS

### v1.0 (Popup)
- Width fija: 450px
- Height máx: 600px
- Vertical scrolling para bets recientes
- Simple dark theme

### v1.1 (Sidebar)
- Width dinámico (sidebar)
- Height: full viewport
- Dos columnas paralelas
- Mejorado layout y spacing

---

## 🔁 Compatibilidad

### Retrocompatibilidad
- ✅ Datos de v1.0 funcionan en v1.1
- ✅ Estructura de apuestas idéntica
- ✅ Firebase sync genérico
- ✅ UI solo cambia, lógica igual

### Browser Notes
- Chrome 114+ requerido para Side Panel API
- Versiones antiguas: fallback a popup si es necesario
- Edge, Brave, Chrome compatible

---

## 🚀 Próximos Pasos (Planificado)

### v1.2
- [ ] Keyboard shortcut (Ctrl+Shift+Y)
- [ ] Settings panel
- [ ] Theme customization

### v2.0
- [ ] Content script para auto-fill
- [ ] OCR integration
- [ ] Real-time stats dashboard
- [ ] Sync oficial con app web

---

## 📈 Estadísticas

### v1.0
- Líneas de código: ~500
- Funciones: 15+
- Archivos: 8
- Tamaño: ~100 KB

### v1.1
- Líneas de código: ~800
- Funciones: 16+ (+ chrome.action.onClicked)
- Archivos: 10 (+ sidebar.html/css)
- Tamaño: ~120 KB

---

**Última actualización**: 23 Feb 2026  
**Versión actual**: 1.1  
**Compatible**: Chrome 114+, Edge 114+, Brave, Chromium

