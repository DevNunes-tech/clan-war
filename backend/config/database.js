const mongoose = require('mongoose');
require('dotenv').config();

async function connectDatabase() {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI não definido no arquivo .env');
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    return mongoose;
}

module.exports = connectDatabase;
