# Extensión de Chrome - Mi Control de Apuestas

Extensión de Chrome para registrar apuestas rápidamente desde cualquier sitio web, con sincronización automática a tu app web.

## Instalación

### 1. Preparar credenciales de Firebase

Abre `popup.js` y reemplaza las credenciales de Firebase:

```javascript
const FIREBASE_CONFIG = {
    apiKey: "tu_api_key_aqui",
    authDomain: "tu_project.firebaseapp.com",
    projectId: "tu_project_id",
    storageBucket: "tu_bucket.appspot.com",
    messagingSenderId: "tu_sender_id",
    appId: "tu_app_id"
};
```

Puedes encontrar estas credenciales en:
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Abre tu proyecto
3. Project settings → General → Descarga configuración

### 2. Cargar extensión en Chrome

1. Abre `chrome://extensions/`
2. Activa "Modo de desarrollador" (esquina superior derecha)
3. Haz clic en "Cargar extensión sin empaquetar"
4. Selecciona la carpeta `chrome-extension/`

### 3. Usar la extensión

- Haz clic en el icono de la extensión en Chrome
- Completa el formulario de apuestas con todos los detalles
- Haz clic en "Guardar Apuesta"
- La apuesta se guardará localmente y se sincronizará automáticamente con tu app web

## Características

✅ **Formulario completo**: Casa, deporte, evento, mercado, cuota, importe, resultado, fecha
✅ **Sincronización automática**: Las apuestas se sincronizan con Firebase
✅ **Historial local**: Muestra las últimas 5 apuestas (incluso sin conexión)
✅ **Indicador de estado**: Muestra si está sincronizado, sincronizando u offline
✅ **Almacenamiento local**: Guarda apuestas aunque no haya conexión
✅ **Sincronización periódica**: Intenta sincronizar cada 5 minutos en segundo plano

## Estructura

```
chrome-extension/
├── manifest.json          # Configuración de la extensión
├── popup.html            # Interfaz del popup
├── popup.js              # Lógica del formulario
├── background.js         # Service Worker para sincronización
├── styles.css            # Estilos
├── images/
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md
```

## Próximos pasos

1. **Integración con Firebase**: Conectar con tu backend de Firebase
2. **Content Scripts**: Captura automática de datos desde sitios de apuestas (Bet365, Betfair, etc.)
3. **OCR**: Reconocimiento automático de cupones desde capturas
4. **Sincronización mejorada**: Cola de sincronización más robusta
5. **Notificaciones**: Alertas cuando cambien los resultados de apuestas

## Troubleshooting

**Las apuestas no se sincronizan**
- Verifica que hayas iniciado sesión en la app web
- Comprueba que las credenciales de Firebase sean correctas
- Abre DevTools (F12) → Console para ver errores

**La extensión no carga**
- Recarga la página (puedes hacer Ctrl+R en el popup)
- Desactiva y reactiva la extensión en `chrome://extensions/`

**Los datos se pierden**
- Chrome storage está limitado a 10MB por extensión
- Los datos se mantienen incluso con la extensión deshabilitada
