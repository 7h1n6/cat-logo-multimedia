const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.optionalAuth = async (req, res, next) => {
    let token;
    if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
        token = req.cookies.jwt;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Buscar usuario y guardar en res.locals
            res.locals.currentUser = await User.findById(decoded.id);
        } catch (error) {
            res.locals.currentUser = null; // Token inválido o expirado
        }
    } else {
        res.locals.currentUser = null;
    }
    next();
};

//Middleware para proteger rutas (solo usuarios logueados)
exports.protect = async (req, res, next) => {
    let token;

    // token en la cookie 'jwt'
    if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
        token = req.cookies.jwt;
    }

    if (!token) {
        req.flash('error', 'Debes iniciar sesión para acceder a esta página');
        return res.redirect('/auth/login');
    }

    try {
        // Verificar que el token es válido y no ha expirado
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Buscar usuario en DB y guardarlo en req.user
        req.user = await User.findById(decoded.id);
        
        // Usuario eliminado y token vivo
        if (!req.user) {
            req.flash('error', 'El usuario ya no existe');
            return res.redirect('/auth/login');
        }

        next(); // Siguiente controlador
    } catch (error) {
        req.flash('error', 'Token inválido o expirado. Inicia sesión de nuevo.');
        res.redirect('/auth/login');
    }
};

//Middleware de autorización (solo administradores)
exports.adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    req.flash('error', 'Acceso denegado. Se requieren permisos de administrador.');
    res.redirect('/');
};