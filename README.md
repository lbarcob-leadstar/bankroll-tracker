# 💰 Bankroll Tracker

Una Progressive Web App (PWA) para gestionar tu bankroll de apuestas deportivas. Funciona completamente offline y guarda todos los datos localmente en tu dispositivo.

## ✨ Características

- 📱 **Instalable como app nativa** en iOS y Android
- 💾 **Almacenamiento local** - Todos tus datos se guardan en tu dispositivo
- 🔒 **Privacidad total** - Sin servidores, sin seguimiento, sin cuentas
- ⚡ **Funciona offline** - No necesita conexión a internet
- 📊 **Estadísticas completas** - Bankroll, ROI, Win Rate, Profit/Loss
- 🎯 **Filtros** - Visualiza apuestas por estado (Todas, Pendientes, Ganadas, Perdidas)
- 📝 **Notas** - Añade análisis y comentarios a cada apuesta
- 🎨 **Diseño moderno** - Interfaz oscura optimizada para móviles

## 🚀 Instalación en GitHub Pages

### 1. Crea un repositorio en GitHub

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Crea un nuevo repositorio (nombre sugerido: `bankroll-tracker`)
3. Marca como público o privado (ambos funcionan)
4. NO inicialices con README, .gitignore o licencia

### 2. Sube los archivos

Opción A - **Usando Git** (recomendado):

```bash
# En tu terminal/consola
cd carpeta-con-los-archivos
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/bankroll-tracker.git
git push -u origin main
```

Opción B - **Usando la interfaz web**:

1. En tu repositorio, haz clic en "Add file" → "Upload files"
2. Arrastra todos los archivos (index.html, manifest.json, sw.js, icon-192.png, icon-512.png)
3. Haz clic en "Commit changes"

### 3. Activa GitHub Pages

1. Ve a tu repositorio en GitHub
2. Haz clic en "Settings" (Configuración)
3. En el menú lateral, haz clic en "Pages"
4. En "Source", selecciona "main" branch
5. Haz clic en "Save"
6. ¡Espera 1-2 minutos!

Tu app estará disponible en:
```
https://TU-USUARIO.github.io/bankroll-tracker/
```

## 📱 Instalación en el móvil

### iPhone/iPad (Safari):

1. Abre la URL de tu GitHub Pages en Safari
2. Toca el botón de compartir (cuadrado con flecha hacia arriba)
3. Desliza hacia abajo y toca "Añadir a pantalla de inicio"
4. Dale un nombre y toca "Añadir"
5. ¡La app aparecerá en tu pantalla de inicio!

### Android (Chrome):

1. Abre la URL de tu GitHub Pages en Chrome
2. Busca el banner "Instalar app" en la parte superior
3. Toca "Instalar"
4. O toca el menú (tres puntos) → "Instalar aplicación"
5. ¡La app aparecerá en tu cajón de aplicaciones!

## 📖 Cómo usar

### Añadir una apuesta

1. Rellena el formulario con:
   - **Deporte/Evento**: ej. Real Madrid vs Barcelona
   - **Tipo de Apuesta**: ej. Gana Local, Más de 2.5 goles
   - **Stake**: Cantidad apostada en euros
   - **Cuota**: Las odds de la apuesta
   - **Estado**: Pendiente, Ganada o Perdida
   - **Notas**: (Opcional) Tu análisis o razones

2. Toca "Añadir Apuesta"

### Ver estadísticas

En la parte superior verás:
- **Bankroll**: Tu saldo actual
- **Beneficio/Pérdida**: Total ganado o perdido
- **ROI**: Retorno de inversión en porcentaje
- **Apuestas Totales**: Número de apuestas registradas
- **Win Rate**: Porcentaje de apuestas ganadas

### Filtrar apuestas

Usa los botones de filtro para ver:
- **Todas**: Todas las apuestas
- **Pendientes**: Apuestas aún sin resolver
- **Ganadas**: Solo apuestas ganadoras
- **Perdidas**: Solo apuestas perdedoras

### Eliminar una apuesta

Toca la "×" en la esquina superior derecha de cualquier apuesta

### Resetear datos

Si quieres empezar de cero, usa el botón "Resetear Todos los Datos" al final de la página

## 🔧 Personalización

### Cambiar el diseño

Edita el archivo `index.html` en la sección `<style>` para modificar:
- Colores (variables CSS en `:root`)
- Tamaños de fuente
- Espaciado
- Etc.

### Cambiar los iconos

Reemplaza `icon-192.png` y `icon-512.png` con tus propios iconos (deben ser PNG)

### Añadir más funcionalidades

Todo el código está en `index.html`. Busca la sección `<script>` para añadir:
- Más estadísticas
- Gráficos
- Exportar datos a CSV
- Categorías de deportes
- Etc.

## 💾 Backup de datos

**Importante**: Los datos se guardan en el navegador de tu dispositivo. Para hacer backup:

### Opción 1: Exportar manualmente
1. Abre las herramientas de desarrollador en el navegador
2. Ve a "Application" → "Local Storage"
3. Copia los valores de `bets` e `initialBankroll`
4. Guárdalos en un archivo de texto

### Opción 2: Añadir función de exportación
Puedes modificar el código para añadir un botón que exporte los datos a JSON

## ⚠️ Importante

- Los datos se guardan **solo en tu dispositivo**
- Si borras los datos del navegador, perderás tu historial
- Haz backups regularmente si tienes datos importantes
- La app funciona offline, pero necesitas internet para instalarla la primera vez

## 🆘 Solución de problemas

### La app no se instala en iPhone

- Asegúrate de usar Safari (no Chrome ni otros navegadores)
- Verifica que estés usando iOS 11.3 o superior

### Los datos desaparecieron

- Puede ocurrir si limpias el caché del navegador
- Usa la función de backup para prevenir pérdidas

### El Service Worker no se registra

- Verifica que estés usando HTTPS (GitHub Pages lo hace automáticamente)
- Mira la consola del navegador para errores

### GitHub Pages no se activa

- Asegúrate de que el repositorio sea público o tengas GitHub Pro para repos privados
- Espera unos minutos después de activarlo

## 📝 Licencia

Este proyecto es de código abierto. Puedes modificarlo y usarlo como quieras.

## 🤝 Contribuciones

¿Ideas para mejorar? Abre un issue o pull request en GitHub.

---

**¡Disfruta gestionando tu bankroll! 💰📊**
