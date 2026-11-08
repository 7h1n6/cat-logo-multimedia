const Taxonomy = require('../models/Taxonomy');

//Mostrar el panel de categorías
exports.renderDashboard = async (req, res) => {
    try {
        // Traemos todas las categorías de la base de datos
        const taxonomies = await Taxonomy.find();
        res.render('taxonomy/index', { 
            title: 'Panel de Categorías', 
            taxonomies 
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al cargar las categorías');
        res.redirect('/');
    }
};

//Crear una nueva categoría base
exports.createCategory = async (req, res) => {
    const { categoriaBase } = req.body;
    try {
        // Verificar si ya existe
        const existing = await Taxonomy.findOne({ categoriaBase });
        if (existing) {
            req.flash('error', 'Esa categoría ya existe');
            return res.redirect('/taxonomy');
        }

        const newTaxonomy = new Taxonomy({ 
            categoriaBase, 
            subcategorias: [] 
        });
        await newTaxonomy.save();
        
        req.flash('success', 'Categoría creada exitosamente');
        res.redirect('/taxonomy');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al crear la categoría');
        res.redirect('/taxonomy');
    }
};

//Añadir una subcategoría a una categoría existente
exports.addSubcategory = async (req, res) => {
    const { categoryId, subcategoriaNombre } = req.body;
    try {
        // $push es un operador de MongoDB que añade un elemento a un array
        await Taxonomy.findByIdAndUpdate(categoryId, {
            $push: { subcategorias: { nombre: subcategoriaNombre, generos: [] } }
        });
        
        req.flash('success', 'Subcategoría añadida');
        res.redirect('/taxonomy');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al añadir la subcategoría');
        res.redirect('/taxonomy');
    }
};

//Añadir un género a una subcategoría
exports.addGenre = async (req, res) => {
    const { categoryId, subcategoriaId, generoNombre } = req.body;
    try {
        // Usamos el operador posicional $ para encontrar la subcategoría exacta dentro del array
        await Taxonomy.updateOne(
            { _id: categoryId, "subcategorias._id": subcategoriaId },
            { $push: { "subcategorias.$.generos": generoNombre } }
        );
        
        req.flash('success', 'Género añadido');
        res.redirect('/taxonomy');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al añadir el género');
        res.redirect('/taxonomy');
    }
};
