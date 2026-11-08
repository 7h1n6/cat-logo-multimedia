const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
            bufferCommands: false,
        });
        console.log('[OK]M ongoDB conectado correctamente');
    } catch (error) {
        console.error('[ERROR] Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;