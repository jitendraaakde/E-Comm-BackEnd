const express = require('express');
const { getSingleProduct, addProductCart } = require('../controllers/productContollers');
const preventRoutes = require('../auth/routesAccessAuth');
const router = express.Router();

router.get('/:id', getSingleProduct);
router.post('/add-cart', preventRoutes, addProductCart);

module.exports = router;
