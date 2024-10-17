const express = require('express');
const { getSingleProduct, addProductCart, getProductCart } = require('../controllers/productContollers');
const preventRoutes = require('../auth/routesAccessAuth');
const router = express.Router();

router.get('/get-cart-items', preventRoutes, getProductCart);
router.post('/add-cart', preventRoutes, addProductCart);
router.get('/:id', getSingleProduct);

module.exports = router;
