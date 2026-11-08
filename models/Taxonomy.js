const mongoose = require('mongoose');

const taxonomySchema = new mongoose.Schema({
    categoriaBase: { type: String, required: true, unique: true },
    subcategorias: [{
        nombre: { type: String, required: true },
        generos: [{ type: String }]
    }]
});