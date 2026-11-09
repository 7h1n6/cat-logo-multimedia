// 1. Forzamos los DNS por si acaso (igual que en app.js)
require('node:dns/promises').setServers(['1.1.1.1', '8.8.8.8']);

// 2. Cargamos las variables de entorno
require('dotenv').config();

const mongoose = require('mongoose');

console.log('⏳ Intentando conectar a MongoDB Atlas...');
const dbURL = process.env.MONGO_URI;
// 3. Intentamos la conexión con un tiempo límite
mongoose.connect(dbURL, {
    serverSelectionTimeoutMS: 15000, // 5 segundos máximo
    bufferCommands: false,
    autoSelectFamily: false
})
.then(() => {
    console.log('¡CONEXIÓN EXITOSA A MONGODB ATLAS!');
    process.exit(0); // Cerramos el script con éxito
})
.catch((err) => {
    console.error('ERROR DE CONEXIÓN:');
    console.error(err.message);
    process.exit(1); // Cerramos con error
});