const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:4173',
        'http://localhost:5173',
        'https://clan-war.vercel.app',
        'https://brootherwood.com.br',
        'http://brootherwood.com.br',
        'https://www.brootherwood.com.br'
    ],
    credentials: true
}));
app.use(express.json());

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

app.get('/', (req, res) => {
    res.send('WarTracker API is running...');
});

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
