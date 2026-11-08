const Item = require('../models/Item');
const Taxonomy = require('../models/Taxonomy');
const fs = require('fs');
const path = require('path');

//Listar todos los ítems
exports.renderIndex = async (req, res) => {
    try {
        // Ordenados por fecha de creación (los más nuevos primero)
        const items = await Item.find().sort({ createdAt: -1 }).populate('creadoPor', 'name');
        res.render('items/index', { title: 'Catálogo', items });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al cargar el catálogo');
        res.redirect('/');
    }
};

//Mostrar formulario de creación
exports.renderCreate = async (req, res) => {
    try {
        // Necesitamos las taxonomías para llenar los selects del formulario
        const taxonomies = await Taxonomy.find();
        res.render('items/create', { title: 'Añadir Ítem', taxonomies });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al cargar el formulario');
        res.redirect('/items');
    }
};

//Procesar la creación
exports.createItem = async (req, res) => {
    try {
        const { titulo, categoria, subcategoria, genero, detalles } = req.body;
        
        // Si se subió una imagen, guardamos su nombre, si no, usamos la default
        const imagen = req.file ? req.file.filename : 'default.jpg';

        const newItem = new Item({
            titulo,
            categoria,
            subcategoria,
            genero,
            imagen,
            detalles: detalles || {}, // El objeto con los campos específicos
            creadoPor: req.user._id
        });

        await newItem.save();
        req.flash('success', 'Ítem añadido al catálogo');
        res.redirect('/items');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al guardar el ítem');
        res.redirect('/items/create');
    }
};

//Mostrar detalle de un ítem
exports.renderShow = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('creadoPor', 'name');
        if (!item) {
            req.flash('error', 'Ítem no encontrado');
            return res.redirect('/items');
        }
        res.render('items/show', { title: item.titulo, item });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al cargar el ítem');
        res.redirect('/items');
    }
};

//Mostrar formulario de edición (con verificación de permisos)
exports.renderEdit = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            req.flash('error', 'Ítem no encontrado');
            return res.redirect('/items');
        }

        // Verificar permisos: Admin o creador del ítem
        if (req.user.role !== 'admin' && item.creadoPor.toString() !== req.user._id.toString()) {
            req.flash('error', 'No tienes permiso para editar este ítem');
            return res.redirect('/items');
        }

        const taxonomies = await Taxonomy.find();
        res.render('items/edit', { title: 'Editar Ítem', item, taxonomies });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al cargar el formulario de edición');
        res.redirect('/items');
    }
};

//Procesar la edición
exports.updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            req.flash('error', 'Ítem no encontrado');
            return res.redirect('/items');
        }

        // Verificar permisos
        if (req.user.role !== 'admin' && item.creadoPor.toString() !== req.user._id.toString()) {
            req.flash('error', 'No tienes permiso para editar este ítem');
            return res.redirect('/items');
        }

        const { titulo, categoria, subcategoria, genero, detalles } = req.body;

        // Actualizar campos
        item.titulo = titulo;
        item.categoria = categoria;
        item.subcategoria = subcategoria;
        item.genero = genero;
        item.detalles = detalles || {};

        // Si se subió una nueva imagen, borramos la anterior y guardamos la nueva
        if (req.file) {
            if (item.imagen !== 'default.jpg') {
                const oldPath = path.join(__dirname, '../public/uploads', item.imagen);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            item.imagen = req.file.filename;
        }

        await item.save();
        req.flash('success', 'Ítem actualizado correctamente');
        res.redirect(`/items/${item._id}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al actualizar el ítem');
        res.redirect(`/items/${req.params.id}/edit`);
    }
};

//Eliminar un ítem
exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            req.flash('error', 'Ítem no encontrado');
            return res.redirect('/items');
        }

        // Verificar permisos
        if (req.user.role !== 'admin' && item.creadoPor.toString() !== req.user._id.toString()) {
            req.flash('error', 'No tienes permiso para eliminar este ítem');
            return res.redirect('/items');
        }

        // Borrar la imagen del disco si no es la default
        if (item.imagen !== 'default.jpg') {
            const imgPath = path.join(__dirname, '../public/uploads', item.imagen);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }

        await Item.findByIdAndDelete(req.params.id);
        req.flash('success', 'Ítem eliminado del catálogo');
        res.redirect('/items');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al eliminar el ítem');
        res.redirect('/items');
    }
};
