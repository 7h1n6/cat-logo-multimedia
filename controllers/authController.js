const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Mostrar formulario de registro
exports.renderRegister = (req, res) => {
    res.render('auth/register', { title: 'Registro' });
};

//Procesar el registro
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'El correo ya está registrado');
            return res.redirect('/auth/register');
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // Crear el usuario
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        req.flash('success', 'Registro exitoso. Ahora puedes iniciar sesión.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al registrar el usuario');
        res.redirect('/auth/register');
    }
};

//Mostrar formulario de login
exports.renderLogin = (req, res) => {
    res.render('auth/login', { title: 'Login' });
};

//Procesar el login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Buscar usuario y pedir contraseña (por el select: false del modelo)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            req.flash('error', 'Credenciales inválidas');
            return res.redirect('/auth/login');
        }

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error', 'Credenciales inválidas');
            return res.redirect('/auth/login');
        }

        // Generar el token JWT (1 día)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Guardar el token en una Cookie HttpOnly (segura, no accesible desde JS del cliente)
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
            maxAge: 24 * 60 * 60 * 1000
        });

        req.flash('success', 'Bienvenido al sistema');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error en el servidor al iniciar sesión');
        res.redirect('/auth/login');
    }
};

//Cerrar sesión
exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000), // Expira en 10 segundos
        httpOnly: true
    });
    req.flash('success', 'Has cerrado sesión correctamente');
    res.redirect('/');
};
