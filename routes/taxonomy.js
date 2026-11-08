const express = require('express');
const router = express.Router();
const taxonomyController = require('../controllers/taxonomyController');
const { protect, adminOnly } = require('../middlewares/auth');

//Rutas para loged y admin
router.use(protect, adminOnly);

router.get('/', taxonomyController.renderDashboard);
router.post('/create-category', taxonomyController.createCategory);
router.post('/add-subcategory', taxonomyController.addSubcategory);
router.post('/add-genre', taxonomyController.addGenre);

module.exports = router;