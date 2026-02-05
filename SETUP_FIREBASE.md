# 🔐 Guía de Configuración Firebase

Tu app ahora tiene autenticación integrada con Firebase. Sigue estos pasos para completar la configuración.

## 📋 Paso 1: Crear proyecto en Firebase

1. Ve a **[Firebase Console](https://console.firebase.google.com)**
2. Haz clic en **"Crear proyecto"**
3. Nombre del proyecto: `bankroll-tracker` (o tu preferencia)
4. Desactiva "Google Analytics" por ahora (opcional)
5. Haz clic en **"Crear"** y espera a que se complete

## 🔑 Paso 2: Obtener configuración Web

1. En **Project Settings** (engranaje arriba a la izquierda)
2. Tab **"General"**
3. Baja hasta **"Your apps"**
4. Haz clic en **"</>"** (Web) si no existe, o copia la existente
5. Copia la configuración que parece así:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project-xxxxx.firebaseapp.com",
  projectId: "your-project-xxxxx",
  storageBucket: "your-project-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef1234567890"
};
```

## ⚙️ Paso 3: Configurar `firebase-config.js`

1. Abre [firebase-config.js](firebase-config.js)
2. Reemplaza las variables de ejemplo con tus valores reales:

```javascript
const firebaseConfig = {
    apiKey: "PEGA_TU_API_KEY_AQUI",
    authDomain: "PEGA_TU_AUTH_DOMAIN_AQUI",
    projectId: "PEGA_TU_PROJECT_ID_AQUI",
    storageBucket: "PEGA_TU_STORAGE_BUCKET_AQUI",
    messagingSenderId: "PEGA_TU_MESSAGING_SENDER_ID_AQUI",
    appId: "PEGA_TU_APP_ID_AQUI"
};
```

## 🔑 Paso 4: Habilitar autenticación por Email/Contraseña

1. En Firebase Console, ve a **Authentication**
2. Tab **"Sign-in method"**
3. Haz clic en **"Email/Password"**
4. Actívalo (switch azul)
5. Haz clic en **"Guardar"**

## 🌐 Paso 5: Habilitar Google login (Opcional)

1. En **Authentication** → **Sign-in method**
2. Busca **"Google"**
3. Actívalo (switch azul)
4. Selecciona tu **"Project support email"**
5. Haz clic en **"Guardar"**

⚠️ **Nota**: En tu localhost funcionará, pero será necesario configurar las URIs autorizadas cuando despliegues.

## 🚀 Paso 6: Configurar CORS (para desarrollo local)

Si accedes desde `http://localhost`:

1. En **Firebase Console** → **Settings**
2. Tab **"Authorized domains"**
3. La mayoría de veces Firebase lo hace automáticamente para localhost
4. Si necesitas agregar manualmente: Haz clic en **"Agregar dominio"**
5. Agrega: `localhost`

## 🧪 Paso 7: Probar la aplicación

1. Abre tu `index.html` en el navegador
2. Verás una pantalla de **Login**
3. Haz clic en **"Regístrate"**
4. Crea una cuenta con:
   - Email: `test@example.com`
   - Contraseña: `123456` (mínimo)
5. ¡Deberías ver la app de Bankroll Tracker!

## 📱 Características de Autenticación incluidas

- ✅ **Login con Email/Contraseña**
- ✅ **Registro de nueva cuenta**
- ✅ **Login con Google**
- ✅ **Recuperación de contraseña**
- ✅ **Logout**
- ✅ **Persistencia de sesión** (permanece conectado)

## 🔍 Solución de problemas

### Los datos no se sincronizan entre dispositivos

Actualmente tu app usa **localStorage** (local). Para sincronizar datos entre dispositivos:

1. En Firebase, crea una colección llamada `bets`
2. En `auth.js`, agrega código para sincronizar con Firestore
3. Los datos se sincronizarán automáticamente

*Esto es opcional - la app funciona offline sin Firestore*

### El login de Google no funciona

**En localhost**: Debería funcionar naturalmente.

**En producción** (GitHub Pages, Vercel, etc):
1. Agrega tu dominio a **Authorized domains** en Firebase
2. Configura OAuth redirect URIs si es necesario

### "apiKey es inválida"

Verifica que:
- Copiaste correctamente el `apiKey` desde Firebase
- No hay espacios adicionales
- Firebase está habilitado para autenticación web

---

## 📚 Documentación útil

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com)
- [JavaScript SDK Reference](https://firebase.google.com/docs/reference/js)

## ✅ Checklist final

- [ ] Proyecto creado en Firebase
- [ ] Configuración web copiada
- [ ] `firebase-config.js` actualizado
- [ ] Email/Contraseña habilitado en Authentication
- [ ] Google Authentication habilitado (opcional)
- [ ] Prueba de registro completada
- [ ] Prueba de login completada

¡Listo! Tu app ahora tiene autenticación segura con Firebase. 🎉
