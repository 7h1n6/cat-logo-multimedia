const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    categoria: { type: String, required: true },
    subcategoria: { type: String, required: true },
    genero: { type: String },
    imagen: { type: String, default: 'default.jpg' },
    detalles: { type: mongoose.Schema.Types.Mixed, default: {} },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });