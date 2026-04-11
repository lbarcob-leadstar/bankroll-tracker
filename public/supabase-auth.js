/**
 * Módulo de Autenticación para Supabase
 * Gestiona login, registro, logout y sesiones
 * Compatible con la estructura actual de la app
 */

class SupabaseAuthManager {
    constructor() {
        this.user = null;
        this.supabase = null;
        this.initialized = false;
        this.onAuthChange();
    }

    /**
     * Inicializar el cliente de Supabase
     */
    async init() {
        if (this.initialized) return;
        
        try {
            await initSupabaseClient();
            this.supabase = getSupabaseClient();
            this.initialized = true;
            
            // Verificar si hay usuario logueado
            const { data, error } = await this.supabase.auth.getSession();
            if (data?.session) {
                this.user = data.session.user;
                localStorage.setItem('firestore_user_uid', this.user.id);
                localStorage.setItem('firestore_user_email', this.user.email);
                localStorage.setItem('currentUserId', this.user.id);
            }
            
            return true;
        } catch (error) {
            console.error('Error initializing Supabase auth:', error);
            return false;
        }
    }

    /**
     * Registra nuevo usuario con email y contraseña
     */
    async register(email, password) {
        try {
            if (!this.supabase) await this.init();
            
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });

            if (error) {
                return this.handleAuthError(error);
            }

            this.user = data.user;
            
            // Crear registro en tabla users
            if (this.user) {
                await this.supabase.from('users').upsert({
                    id: this.user.id,
                    email: email
                });
                
                // Guardar datos en localStorage para compatibilidad
                localStorage.setItem('firestore_user_uid', this.user.id);
                localStorage.setItem('firestore_user_email', email);
                localStorage.setItem('currentUserId', this.user.id);
                localStorage.setItem('isFirstRegistration', 'true');
            }

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
            if (!this.supabase) await this.init();
            
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return this.handleAuthError(error);
            }

            this.user = data.user;
            
            // Guardar datos en localStorage para compatibilidad
            localStorage.setItem('firestore_user_uid', this.user.id);
            localStorage.setItem('firestore_user_email', email);
            localStorage.setItem('currentUserId', this.user.id);

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
            if (!this.supabase) await this.init();
            
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) {
                return this.handleAuthError(error);
            }

            // Nota: Con OAuth, el usuario será redirigido
            // El callback manejará la sesión

            return { success: true };
        } catch (error) {
            return this.handleAuthError(error);
        }
    }

    /**
     * Logout
     */
    async logout() {
        try {
            if (!this.supabase) await this.init();
            
            await this.supabase.auth.signOut();
            this.user = null;
            
            // Limpiar localStorage
            localStorage.removeItem('firestore_user_uid');
            localStorage.removeItem('firestore_user_email');
            localStorage.removeItem('currentUserId');
            localStorage.removeItem('bets');
            localStorage.removeItem('initialBankroll');

            return { success: true };
        } catch (error) {
            return this.handleAuthError(error);
        }
    }

    /**
     * Enviar email de recuperación de contraseña
     */
    async sendPasswordReset(email) {
        try {
            if (!this.supabase) await this.init();
            
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) {
                return this.handleAuthError(error);
            }

            return { 
                success: true, 
                message: 'Email de recuperación enviado. Revisa tu bandeja.' 
            };
        } catch (error) {
            return this.handleAuthError(error);
        }
    }

    /**
     * Cambiar contraseña
     */
    async updatePassword(newPassword) {
        try {
            if (!this.supabase) await this.init();
            
            const { error } = await this.supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                return this.handleAuthError(error);
            }

            return { success: true, message: 'Contraseña actualizada' };
        } catch (error) {
            return this.handleAuthError(error);
        }
    }

    /**
     * Recuperar contraseña (alias para compatibilidad)
     */
    async resetPassword(email) {
        return this.sendPasswordReset(email);
    }

    /**
     * Monitorear cambios de autenticación
     */
    onAuthChange() {
        if (typeof window === 'undefined') return;
        
        this.init().then(() => {
            // Escuchar cambios de sesión
            this.supabase.auth.onAuthStateChange((event, session) => {
                if (session) {
                    this.user = session.user;
                    localStorage.setItem('firestore_user_uid', session.user.id);
                    localStorage.setItem('firestore_user_email', session.user.email);
                    localStorage.setItem('currentUserId', session.user.id);
                    
                    // Mostrar app y ocultar auth pages
                    if (typeof showApp === 'function') showApp();
                    if (typeof hideAuthPages === 'function') hideAuthPages();
                    
                    // Disparar evento personalizado
                    window.dispatchEvent(new CustomEvent('authChanged', {
                        detail: { user: this.user }
                    }));
                } else {
                    this.user = null;
                    localStorage.removeItem('firestore_user_uid');
                    localStorage.removeItem('firestore_user_email');
                    localStorage.removeItem('currentUserId');
                    
                    // Ocultar app y mostrar auth pages
                    if (typeof hideApp === 'function') hideApp();
                    if (typeof showAuthPages === 'function') showAuthPages();
                }
            });
        });
    }

    /**
     * Manejar errores de autenticación
     */
    handleAuthError(error) {
        const errorMessages = {
            'auth/email-already-in-use': 'Este email ya está registrado',
            'auth/invalid-email': 'Email inválido',
            'auth/weak-password': 'Contraseña muy débil',
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/popup-blocked': 'El popup fue bloqueado. Habilita popups en tu navegador',
            'invalid_grant': 'Email o contraseña incorrectos',
            'user_already_exists': 'Este email ya está registrado',
            'validation_failed': 'Datos de entrada inválidos'
        };

        let message = error.message || 'Error desconocido';
        
        // Buscar en error codes comunes
        for (const [code, msg] of Object.entries(errorMessages)) {
            if (error.message.includes(code) || error.code === code) {
                message = msg;
                break;
            }
        }

        return {
            success: false,
            message: message,
            code: error.code
        };
    }

    /**
     * Obtener el usuario actual
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Verificar si hay usuario autenticado
     */
    isAuthenticated() {
        return !!this.user;
    }

    /**
     * Obtener email del usuario
     */
    getUserEmail() {
        return this.user?.email || null;
    }
}

// Crear instancia global
const authManager = new SupabaseAuthManager();

// Make globally accessible
window.authManager = authManager;
