const mongoose = require('mongoose');

const dbURL = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(dbURL, {
            serverSelectionTimeoutMS: 15000,
            bufferCommands: false,
            autoSelectFamily: false
        });
        console.log('[OK] MongoDB conectado correctamente');
    } catch (error) {
        console.error('[ERROR] Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
