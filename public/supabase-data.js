/**
 * Servicio de Datos para Supabase
 * Gestiona todas las operaciones CRUD de apuestas
 */

class SupabaseDataService {
    constructor() {
        this.supabase = null;
        this.initialized = false;
    }

    /**
     * Inicializar el servicio
     */
    async init() {
        if (this.initialized) return;
        
        try {
            await initSupabaseClient();
            this.supabase = getSupabaseClient();
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing data service:', error);
            return false;
        }
    }

    /**
     * Obtener todas las apuestas del usuario
     */
    async getBets(userId) {
        try {
            await this.init();
            
            const { data, error } = await this.supabase
                .from('bets')
                .select('*')
                .eq('user_id', userId)
                .order('bet_date', { ascending: false });

            if (error) throw error;
            
            return { success: true, data: data || [] };
        } catch (error) {
            console.error('Error fetching bets:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener apuestas por rango de fechas
     */
    async getBetsByDateRange(userId, startDate, endDate) {
        try {
            await this.init();
            
            const { data, error } = await this.supabase
                .from('bets')
                .select('*')
                .eq('user_id', userId)
                .gte('bet_date', startDate)
                .lte('bet_date', endDate)
                .order('bet_date', { ascending: false });

            if (error) throw error;
            
            return { success: true, data: data || [] };
        } catch (error) {
            console.error('Error fetching bets by date range:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Crear nueva apuesta
     */
    async createBet(userId, betData) {
        try {
            await this.init();
            
            const { data, error } = await this.supabase
                .from('bets')
                .insert([{
                    user_id: userId,
                    ...betData
                }])
                .select();

            if (error) throw error;
            
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error creating bet:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualizar apuesta
     */
    async updateBet(betId, betData) {
        try {
            await this.init();
            
            const { data, error } = await this.supabase
                .from('bets')
                .update(betData)
                .eq('id', betId)
                .select();

            if (error) throw error;
            
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error updating bet:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Eliminar apuesta
     */
    async deleteBet(betId) {
        try {
            await this.init();
            
            const { error } = await this.supabase
                .from('bets')
                .delete()
                .eq('id', betId);

            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting bet:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener la banca inicial del usuario
     */
    async getInitialBankroll(userId) {
        try {
            await this.init();
            
            const { data, error } = await this.supabase
                .from('users')
                .select('initial_bankroll')
                .eq('id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
            
            return { success: true, bankroll: data?.initial_bankroll || 0 };
        } catch (error) {
            console.error('Error fetching initial bankroll:', error);
            return { success: false, error: error.message, bankroll: 0 };
        }
    }

    /**
     * Actualizar la banca inicial del usuario
     */
    async setInitialBankroll(userId, bankroll) {
        try {
            await this.init();
            
            // Update only the bankroll field for existing user row
            const { error } = await this.supabase
                .from('users')
                .update({ initial_bankroll: bankroll })
                .eq('id', userId);

            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            console.error('Error setting initial bankroll:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener estadísticas del usuario
     */
    async getStats(userId) {
        try {
            await this.init();
            
            const { data, error } = await this.supabase
                .from('bets')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            const bets = data || [];
            const winBets = bets.filter(b => b.status === 'win');
            const lossBets = bets.filter(b => b.status === 'loss');
            const totalStaked = bets.reduce((sum, b) => sum + parseFloat(b.stake || 0), 0);
            const totalProfit = bets.reduce((sum, b) => sum + parseFloat(b.profit || 0), 0);

            return {
                success: true,
                stats: {
                    totalBets: bets.length,
                    wins: winBets.length,
                    losses: lossBets.length,
                    pending: bets.filter(b => b.status === 'pending').length,
                    totalStaked,
                    totalProfit,
                    winRate: bets.length ? ((winBets.length / bets.length) * 100).toFixed(2) : 0,
                    yield: totalStaked > 0 ? ((totalProfit / totalStaked) * 100).toFixed(2) : 0,
                    roi: totalStaked > 0 ? ((totalProfit / totalStaked) * 100).toFixed(2) : 0
                }
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Migrar datos de localStorage a Supabase
     */
    async migrateFromLocalStorage(userId) {
        try {
            await this.init();
            
            const savedBets = localStorage.getItem('bets');
            const initialBankroll = localStorage.getItem('initialBankroll');

            if (!savedBets) {
                return { success: true, message: 'No data to migrate' };
            }

            const bets = JSON.parse(savedBets);
            
            // Crear las apuestas en Supabase
            const betDataToInsert = bets.map(bet => ({
                user_id: userId,
                bet_type: bet.type || 'simple',
                house: bet.house,
                sport: bet.sport,
                event: bet.event,
                market: bet.market,
                additional_markets: bet.additionalMarkets ? JSON.stringify(bet.additionalMarkets) : null,
                odds: bet.odds,
                stake: bet.stake,
                stake_type: bet.stakeType || 'currency',
                profit: bet.profit,
                status: bet.status,
                notes: bet.notes,
                bet_date: bet.date
            }));

            const { error: insertError } = await this.supabase
                .from('bets')
                .insert(betDataToInsert);

            if (insertError) throw insertError;

            // Actualizar banca inicial
            if (initialBankroll) {
                await this.setInitialBankroll(userId, parseFloat(initialBankroll));
            }

            return { 
                success: true, 
                message: `Migrados ${bets.length} apuestas exitosamente` 
            };
        } catch (error) {
            console.error('Error migrating data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Exportar datos a CSV
     */
    async exportToCSV(userId) {
        try {
            const result = await this.getBets(userId);
            if (!result.success) throw new Error('Error fetching bets');

            const bets = result.data;
            const headers = [
                'Fecha', 'Casa', 'Deporte', 'Evento', 'Mercado', 
                'Cuota', 'Importe', 'Estado', 'Beneficio', 'Notas'
            ];

            const rows = bets.map(bet => [
                bet.bet_date,
                bet.house,
                bet.sport,
                bet.event,
                bet.market,
                bet.odds,
                bet.stake,
                bet.status,
                bet.profit || '',
                bet.notes || ''
            ]);

            const csv = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            return { success: true, csv };
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener histórico de ROI para gráficas
     */
    async getROIHistory(userId, days = 30) {
        try {
            await this.init();
            
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data, error } = await this.supabase
                .from('bets')
                .select('*')
                .eq('user_id', userId)
                .gte('bet_date', startDate.toISOString().split('T')[0])
                .order('bet_date', { ascending: true });

            if (error) throw error;

            // Procesar datos para gráfica
            const roi = [];
            let totalProfit = 0;
            let totalStaked = 0;

            if (data) {
                data.forEach(bet => {
                    totalStaked += parseFloat(bet.stake || 0);
                    totalProfit += parseFloat(bet.profit || 0);
                    roi.push({
                        date: bet.bet_date,
                        roi: totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0,
                        profit: totalProfit,
                        staked: totalStaked
                    });
                });
            }

            return { success: true, data: roi };
        } catch (error) {
            console.error('Error fetching ROI history:', error);
            return { success: false, error: error.message };
        }
    }
}

// Crear instancia global
const dataService = new SupabaseDataService();

// Make globally accessible
window.dataService = dataService;
