const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDatabase = require('./config/database');
const { ensureEnv } = require('./middleware/validateEnv');
require('dotenv').config();

ensureEnv();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'https://clan-war.vercel.app',
    'https://brootherwood.com.br',
    'http://brootherwood.com.br',
    'https://www.brootherwood.com.br'
];

const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (/^https:\/\/clan-war.*\.vercel\.app$/.test(origin)) return true;
    return false;
};

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.use(express.json());

// Endpoints de Health Check e Ping (para Cron Jobs, Keep-Alive e pre-warm do frontend)
// Executados ANTES do middleware de banco para garantir resposta imediata e sem timeout
app.get(['/', '/health', '/api/health', '/api/ping'], async (req, res) => {
    let dbStatus = 'disconnected';
    try {
        if (mongoose.connection.readyState === 1) {
            dbStatus = 'connected';
        } else {
            // Tenta reconectar em background sem bloquear o response do ping
            connectDatabase().catch((err) => console.error('Ping DB reconnect error:', err.message));
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
        message: 'WarTracker API is alive and running'
    });
});

app.use(async (req, res, next) => {
    try {
        await connectDatabase();
        next();
    } catch (err) {
        console.error('Could not connect to MongoDB', err);
        res.status(500).json({ message: 'Could not connect to database' });
    }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/clan', require('./routes/clan'));
app.use('/api/user', require('./routes/user'));

async function startServer() {
    try {
        await connectDatabase();
        console.log('Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Could not connect to MongoDB', err);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = app;
