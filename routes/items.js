const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Rutas públicas
router.get('/', itemController.renderIndex);
router.get('/:id', itemController.renderShow);

// Rutas protegidas (requieren login)
router.get('/create', protect, itemController.renderCreate);
router.post('/create', protect, upload.single('imagen'), itemController.createItem);

router.get('/:id/edit', protect, itemController.renderEdit);
router.post('/:id/edit', protect, upload.single('imagen'), itemController.updateItem);

router.post('/:id/delete', protect, itemController.deleteItem);

module.exports = router;