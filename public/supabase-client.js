/**
 * Supabase Client Configuration
 * 
 * Este archivo inicializa el cliente de Supabase para la app
 * Obtiene la configuración del servidor en /api/config
 */

let supabase = null;

// Cargar configuración de Supabase
async function initSupabaseClient() {
  try {
    if (supabase) return supabase;
    
    // Obtener configuración del servidor
    const response = await fetch('/api/config');
    if (!response.ok) throw new Error('Failed to load Supabase config');
    
    const { supabaseUrl, supabaseAnonKey } = await response.json();
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    // Inicializar cliente de Supabase
    supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('✅ Supabase initialized');
    return supabase;
  } catch (error) {
    console.error('❌ Error initializing Supabase:', error);
    throw error;
  }
}

// Obtener la instancia de Supabase
function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Call initSupabaseClient() first');
  }
  return supabase;
}
