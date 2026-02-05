/**
 * Firebase Configuration
 * 
 * IMPORTANT: Reemplaza las values abajo con tus credenciales de Firebase
 * 
 * 1. Ve a: https://console.firebase.google.com
 * 2. Crea un nuevo proyecto o selecciona uno existente
 * 3. En "Project Settings" → "General", baja hasta "Your apps"
 * 4. Copia la configuración de tu app web
 */

const firebaseConfig = {
    apiKey: "AIzaSyDxpJhpatZR6qpSQU8pucZHp8HGgSCKRbg",
    authDomain: "bankroll-tracker-79d49.firebaseapp.com",
    projectId: "bankroll-tracker-79d49",
    storageBucket: "bankroll-tracker-79d49.firebasestorage.app",
    messagingSenderId: "182216512734",
    appId: "1:182216512734:web:bfb80d920d13bd35f21e4f",
    measurementId: "G-MF5VPMNB0C"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Configuración de persistencia (login permanece activo)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(error => console.log('Persist error:', error.code));
