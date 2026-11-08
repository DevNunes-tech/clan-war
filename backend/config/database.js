const mongoose = require('mongoose');
require('dotenv').config();

// Listeners de conexão (logs úteis em produção)
mongoose.connection.on('connected', () => console.log('[mongo] connected'));
mongoose.connection.on('disconnected', () => console.warn('[mongo] disconnected'));
mongoose.connection.on('error', (err) => console.error('[mongo] error:', err.message));
mongoose.connection.on('reconnected', () => console.log('[mongo] reconnected'));

let connectionPromise = null;

async function connectDatabase() {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI não definido no arquivo .env');
    }

    // Já conectado?
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    // Conectando agora? Retorna o mesmo promise (evita race condition)
    if (connectionPromise) {
        return connectionPromise;
    }

    const scheme = process.env.MONGODB_URI.split(':')[0];
    console.log(`[mongo] conectando via ${scheme}://...`);

    connectionPromise = mongoose
        .connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10,
        })
        .then((m) => {
            connectionPromise = null;
            return m;
        })
        .catch((err) => {
            connectionPromise = null;
            throw err;
        });

    return connectionPromise;
}

module.exports = connectDatabase;