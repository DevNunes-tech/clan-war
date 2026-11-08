// ⚠️ PRIMEIRA LINHA — carrega .env ANTES de qualquer require
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDatabase = require('./config/database');
const { ensureEnv } = require('./middleware/validateEnv');

ensureEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Necessário para rate limit e req.ip atrás do proxy do Render
app.set('trust proxy', 1);

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────
const allowedOrigins = [
    // Local dev
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    // Vercel (frontend)
    'https://clan-war.vercel.app',
    'https://clan-war-git-main.vercel.app',
    // Domínio próprio
    'https://brootherwood.com.br',
    'https://www.brootherwood.com.br',
    'http://brootherwood.com.br',
];

const isAllowedOrigin = (origin) => {
    if (!origin) return true; // curl, Postman, mobile
    if (allowedOrigins.includes(origin)) return true;
    return /^https:\/\/clan-war[a-z0-9-]*\.vercel\.app$/.test(origin);
};

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) return callback(null, true);
        console.warn(`[CORS] Origem bloqueada: ${origin}`);
        return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
}));

app.use(express.json({ limit: '1mb' }));

// ─────────────────────────────────────────────────────────────
// Health check (antes do DB middleware — resposta rápida)
// ─────────────────────────────────────────────────────────────
app.get(['/', '/health', '/api/health', '/api/ping'], async (req, res) => {
    let dbStatus = 'disconnected';
    try {
        if (mongoose.connection.readyState === 1) {
            dbStatus = 'connected';
        } else {
            connectDatabase().catch((err) =>
                console.error('Ping DB reconnect error:', err.message)
            );
            dbStatus = 'connecting';
        }
    } catch {
        dbStatus = 'error';
    }

    res.status(200).json({
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        database: dbStatus,
        message: 'WarTracker API is alive and running',
    });
});

// ─────────────────────────────────────────────────────────────
// Rotas
// ─────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clan', require('./routes/clan'));
app.use('/api/user', require('./routes/user'));

// ─────────────────────────────────────────────────────────────
// 404 handler
// ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    });
});

// ─────────────────────────────────────────────────────────────
// Error handler global
// ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[Unhandled Error]', err);
    res.status(err.status || 500).json({
        success: false,
        message:
            process.env.NODE_ENV === 'production'
                ? 'Erro interno do servidor'
                : err.message,
    });
});

// ─────────────────────────────────────────────────────────────
// Boot
// ─────────────────────────────────────────────────────────────
async function startServer() {
    try {
        await connectDatabase();
        console.log('[startup] Connected to MongoDB');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`[startup] Server is running on port ${PORT}`);
            console.log(`[startup] NODE_ENV=${process.env.NODE_ENV || 'development'}`);
            console.log(
                `[startup] CLASH_ROYALE_BASE_URL=${process.env.CLASH_ROYALE_BASE_URL || '(usando fallback RoyaleAPI)'}`
            );
            console.log(
                `[startup] CLASH_ROYALE_API_KEY=${process.env.CLASH_ROYALE_API_KEY ? `definida (${process.env.CLASH_ROYALE_API_KEY.length} chars)` : '❌ AUSENTE'}`
            );
        });
    } catch (err) {
        console.error('[startup] Could not connect to MongoDB:', err.message);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = app;