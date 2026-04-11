import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load .env.local first (with override), then .env as fallback
dotenv.config({ path: '.env.local', override: true });
dotenv.config(); // loads .env as fallback

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API endpoint para obtener configuración de Supabase
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
  });
});

// Catch-all route para servir index.html (para PWA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Para Vercel serverless: exportar app
export default app;

// Para desarrollo local: arrancar servidor
const isVercel = process.env.VERCEL || process.env.NOW_REGION;
if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}
