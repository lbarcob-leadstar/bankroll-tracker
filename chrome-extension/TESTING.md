# 🧪 Testing Guide - Apuestas Simples vs Combinadas

## Pre-requisitos
- ✅ Extensión cargada en Chrome
- ✅ Popup abierto y visible
- ✅ Chrome DevTools disponibles (F12)

---

## Test 1: Selector de Tipo de Apuesta

### 1.1 Aparición del Selector
- [ ] **Verificar**: El selector aparece al principio del formulario
- [ ] **Esperado**: Dos opciones: 🎯 Simple y 📊 Combinada
- [ ] **Estado inicial**: Simple debe estar seleccionada (verde)

### 1.2 Click en Combinada
1. Haz click en "Combinada"
2. [ ] **Verificar**: 
   - Botón "+" aparece bajo el campo Mercado
   - Texto "Combinada" se vuelve verde
   - "Simple" se vuelve gris

### 1.3 Click en Simple
1. Desde Combinada, haz click en Simple
2. [ ] **Verificar**:
   - Botón "+" desaparece
   - Texto "Simple" se vuelve verde
   - Mercados adicionales se **limpian automáticamente**
   - "Combinada" se vuelve gris

### 1.4 Estilos Visuales
- [ ] Colores coinciden con app principal (verde #04a77d)
- [ ] Iconos visibles y legibles
- [ ] Transiciones suaves al hacer click

---

## Test 2: Botón "+" para Múltiples Mercados

### 2.1 Visibilidad Condicional
1. Selecciona "Simple"
   - [ ] Botón "+" debe estar **oculto**
2. Selecciona "Combinada"
   - [ ] Botón "+" debe estar **visible**

### 2.2 Añadir Mercados
1. Selecciona "Combinada"
2. Completa el primer mercado: "Gana Local"
3. Haz click en "+"
   - [ ] Nuevo campo aparece con animación
   - [ ] Placeholder: "Ej: Gana visitante, Menos de 3.5"
   - [ ] Botón "✕" rojo aparece

### 2.3 Añadir Múltiples Mercados
1. Haz click "+" una segunda vez
   - [ ] Aparece otro campo
   - [ ] Todos los campos están visibles
   - [ ] Cada uno tiene botón "✕"

### 2.4 Ordenamiento
- [ ] Primer campo de mercado está al principio
- [ ] Mercados adicionales aparecen debajo

---

## Test 3: Eliminar Mercados

### 3.1 Botón "✕"
1. Completa 3 mercados (principal + 2 adicionales)
2. Haz click en "✕" del primer mercado adicional
   - [ ] Campo se elimina (con animación suave)
   - [ ] Otros campos permanecen

### 3.2 Eliminar Todos los Adicionales
1. Haz click "✕" en todos los mercados adicionales
   - [ ] Solo queda el campo principal
   - [ ] Botón "+" sigue visible

### 3.3 Mercados Adicionales = 0
1. Desde Combinada con múltiples mercados, selecciona Simple
   - [ ] **IMPORTANTE**: Botón "+" desaparece Y se limpian mercados secundarios
   - [ ] Solo queda el campo principal

---

## Test 4: Validación de Mercados

### 4.1 Mercado Vacío
1. Selecciona "Combinada"
2. Deja vacío el campo de mercado principal
3. Haz click "Guardar"
   - [ ] **Mensaje de error**: "Debes especificar al menos un mercado"
   - [ ] Botón se habilita nuevamente

### 4.2 Al Menos Uno Requerido
1. Completa: Mercado principal = "Gana Local"
2. Campo adicional = vacío (opcional)
3. Haz click "Guardar"
   - [ ] **Debe funcionar** (solo usa mercado principal)

---

## Test 5: Guardar Apuesta Combinada

### 5.1 Apuesta con 3 Mercados
1. Completa el formulario:
   - Tipo: Combinada
   - Casa: Bet365
   - Deporte: ⚽ Fútbol
   - Evento: Real Madrid vs Barcelona
   - Mercados: "Gana Local" + "Más de 2.5" + "Ambos Marcan"
   - Cuota: 8.75
   - Importe: 5€
   - Resultado: Pendiente
   - Fecha: Hoy

2. Click "Guardar Apuesta"
   - [ ] Mensaje de éxito aparece
   - [ ] Botón muestra "Guardando..." temporalmente
   - [ ] El formulario se **resetea completamente**

### 5.2 Verificar Reset
Después de guardar:
- [ ] Tipo vuelve a "Simple"
- [ ] Campo mercado está vacío
- [ ] Botón "+" está **oculto**
- [ ] Mercados adicionales fueron **eliminados**
- [ ] Fecha se establish a hoy

---

## Test 6: Visualización en "Últimas apuestas"

### 6.1 Apuesta Simple
1. Guarda una apuesta simple con mercado "Gana Local"
2. En "Últimas apuestas" debe verse:
   - [ ] "Chelsea vs Barcelona"
   - [ ] "Bet365 • 2.50 • €10"
   - [ ] "Gana Local" (sin badge)

### 6.2 Apuesta Combinada
1. Guarda una apuesta combinada con 3 mercados
2. En "Últimas apuestas" debe verse:
   - [ ] "Real Madrid vs Barcelona"
   - [ ] "Betfair • 8.75 • €5"
   - [ ] Badge verde "+2 Gana Local"
   - [ ] Status badge (Pendiente/Ganada/Perdida)

### 6.3 Conteo Correcto
- 1 mercado adicional = "+1"
- 2 mercados adicionales = "+2"
- 3 mercados adicionales = "+3"

---

## Test 7: Almacenamiento Local

### 7.1 Verificar en Chrome Storage
1. Abre DevTools (F12)
2. Ve a **Application** → **Chrome Storage** → **Local**
3. Busca la key "bets"
4. Expande y verifica último bet:
   - [ ] Campo `type: "simple"` o `"combined"`
   - [ ] Campo `market: "Gana Local"` (si es simple)
   - [ ] Campo `markets: ["Gana Local", "Más de 2.5"]` (si es combinada)
   - [ ] Campo `synced: false`

### 7.2 Estructura de Array
Para apuesta combinada, `markets` debe ser array:
```json
"markets": ["Gana Local", "Más de 2.5", "Ambos Marcan"]
```

---

## Test 8: Compatibilidad

### 8.1 Con App Principal
1. En la app web principal, crea una apuesta combinada
2. Verifica que tenga la misma estructura
3. En la extensión, crea una apuesta combinada similar
4. Compara estructura en Storage
   - [ ] Campos `type` y `markets` coinciden

### 8.2 Retrocompatibilidad
1. Abre DevTools Console
2. Edita un bet antiguo (sin campo `type`)
3. Carga la extensión
4. La apuesta debe:
   - [ ] Mostrarse como Simple
   - [ ] No fallar en visualización

---

## Test 9: Performance

### 9.1 Velocidad de Respuesta
1. Selecciona Combinada
2. Haz 5 clicks en "+" rápidamente
   - [ ] Todos los campos aparecen sin lag
   - [ ] UI permanece responsiva

### 9.2 Limpieza de Memoria
1. Crea y guarda 50+ apuestas
2. Recarga la extensión
   - [ ] No hay ralentización
   - [ ] Lista "Últimas apuestas" funciona correctamente

---

## Test 10: Casos Extremos

### 10.1 Nombres de Mercado Largos
1. Introduce: "Gana el equipo local en tiempo regular más 0.5 goles exactos"
2. Haz click guardar
   - [ ] Se guarda sin truncarse
   - [ ] Se muestra completo en list

### 10.2 Caracteres Especiales
1. Intro: "Manchester United 🔴 vs Liverpool 🔴"
2. Click guardar
   - [ ] Emojis se guardan correctamente
   - [ ] Se muestran en list

### 10.3 Muchos Mercados
1. Añade 10 mercados (máximo práctico)
2. Scroll en popup debe funcionar
   - [ ] Todos los campos son accesibles
   - [ ] Botón guardar sigue visible

---

## Test 11: Animaciones

- [ ] Transición de color al seleccionar tipo: 300ms
- [ ] Entrada de nuevo mercado: `slideIn` suave
- [ ] Salida de mercado eliminado: instantáneo
- [ ] Pulso del status dot: continuo

---

## ✅ Checklist Final

- [ ] Selector de tipo funciona perfectamente
- [ ] Botón "+" aparece/desaparece correctamente  
- [ ] Múltiples mercados se guardan como array
- [ ] Reset limpia todo correctamente
- [ ] Apuestas combinadas muestran badge "+N"
- [ ] Storage contiene estructura correcta
- [ ] Sin errores de consola (F12)
- [ ] Estilos coinciden con app principal
- [ ] Compatibilidad con app web verificada
- [ ] Performance es óptima

---

## 🐛 Debugging

Si encuentras problemas, revisa:

### Console Errors
```javascript
// Abre F12 → Console
// Busca errores rojo o amarillo
// Verifica betType y collectMarkets()
```

### Storage Issues
```javascript
// Abre F12 → Application → Chrome Storage
// Busca "bets" en Local Storage
// Verifica estructura JSON
```

### UI Problems
```javascript
// Inspeccion  (F12 → Elements)
// Verifica clases: .bet-type-selector, .markets-container
// Busca `display: none` en estilo
```

---

**Versión de test**: 1.1  
**Última actualización**: 23 Feb 2026  
**Plataformas**: Chrome, Chromium, Edge
