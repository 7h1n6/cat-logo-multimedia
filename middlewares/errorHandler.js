//Middleware para rutas no encontradas (404)
exports.notFound = (req, res, next) => {
    res.status(404).render('error', { 
        title: '404 - No encontrado', 
        status: 404, 
        message: 'La página que buscas no existe.' 
    });
};

//Middleware global de errores (500)
exports.errorHandler = (err, req, res, next) => {
    console.error('ERROR:', err.stack);
    
    // Si el error es de Multer (ej. archivo muy pesado)
    if (err.code === 'LIMIT_FILE_SIZE') {
        req.flash('error', 'La imagen es demasiado grande (máximo 5MB)');
        return res.redirect('back');
    }

    res.status(500).render('error', { 
        title: '500 - Error del Servidor', 
        status: 500, 
        message: 'Algo salió mal en el servidor. Por favor, intenta de nuevo más tarde.' 
    });
};