//require('dns').setServers(['1.1.1.1', '8.8.8.8']);

require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const connectDB = require('./config/database');
const { optionalAuth } = require('./middlewares/auth');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Configuración de Express
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'secreto_sesion_2026',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use(optionalAuth);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
const authRoutes = require('./routes/auth');
const taxonomyRoutes = require('./routes/taxonomy');
const itemRoutes = require('./routes/items');
const exportRoutes = require('./routes/export');

app.use('/auth', authRoutes);
app.use('/taxonomy', taxonomyRoutes);
app.use('/items', itemRoutes);
app.use('/export', exportRoutes);

app.get('/', (req, res) => {
    res.render('index', { title: 'Inicio' }); 
});

// Middlewares de error
app.use(notFound);
app.use(errorHandler);

//Iniciar server
const startServer = async () => {
    const PORT = process.env.PORT || 3000;
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    }); 
};

startServer();