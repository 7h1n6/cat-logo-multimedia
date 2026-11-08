const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { protect } = require('../middlewares/auth');

// Ruta para exportar.
router.get('/', protect, exportController.exportCatalog);

module.exports = router;