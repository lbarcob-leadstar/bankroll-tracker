/**
 * Módulo de Autenticación
 * Gestiona login, registro, logout y sesiones
 */

class AuthManager {
    constructor() {
        this.user = null;
        this.onAuthChange();
    }

    /**
     * Registra nuevo usuario con email y contraseña
     */
    async register(email, password) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            this.user = userCredential.user;
            return { success: true, user: this.user };
        } catch (error) {
            return this.handleAuthError(error);
        }
    }

    /**
     * Login con email y contraseña
     */
    async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            this.user = userCredential.user;
            return { success: true, user: this.user };
        } catch (error) {
            return this.handleAuthError(error);
        }
    }

    /**
     * Login con Google
     */
    async loginWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const userCredential = await auth.signInWithPopup(provider);
            this.user = userCredential.user;
            return { success: true, user: this.user };
        } catch (error) {
            // Si el popup se rechaza, intenta con redirect
            if (error.code === 'auth/popup-blocked') {
                return { success: false, message: 'El popup fue bloqueado. Habilita popups en tu navegador.' };
            }
            return this.handleAuthError(error);
        }
    }

    /**
     * Logout
     */
    async logout() {
        try {
            await auth.signOut();
            this.user = null;
            return { success: true };
        } catch (error) {
            return this.handleAuthError(error);
        }
    }

    /**
     * Recuperar contraseña
     */
    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            return { success: true, message: 'Email de recuperación enviado' };
        } catch (error) {
            return this.handleAuthError(error);
        }
    }

    /**
     * Manejar cambios de autenticación
     */
    onAuthChange() {
        auth.onAuthStateChanged((user) => {
            this.user = user;
            if (user) {
                showApp();
                hideAuthPages();
            } else {
                hideApp();
                showAuthPages();
            }
        });
    }

    /**
     * Manejar errores de Firebase
     */
    handleAuthError(error) {
        const errorMessages = {
            'auth/email-already-in-use': 'Este email ya está registrado',
            'auth/invalid-email': 'Email inválido',
            'auth/weak-password': 'Contraseña débil (mínimo 6 caracteres)',
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/too-many-login-attempts': 'Demasiados intentos de login. Intenta más tarde',
        };

        const message = errorMessages[error.code] || error.message || 'Error de autenticación';
        return { success: false, message, code: error.code };
    }

    /**
     * Obtener usuario actual
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Verificar si usuario está autenticado
     */
    isAuthenticated() {
        return this.user !== null;
    }

    /**
     * Obtener email del usuario
     */
    getUserEmail() {
        return this.user?.email || null;
    }
}

// Instancia global
const authManager = new AuthManager();

// Funciones para mostrar/ocultar elementos
function showApp() {
    document.querySelectorAll('.auth-page').forEach(p => p.style.display = 'none');
    document.getElementById('appContent').style.display = 'block';
}

function hideApp() {
    document.getElementById('appContent').style.display = 'none';
}

function showAuthPages() {
    document.querySelectorAll('.auth-page').forEach(p => p.style.display = 'none');
}

function hideAuthPages() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
}
