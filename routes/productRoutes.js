const express = require('express');
const { getSingleProduct, addProductCart, getProductCart, removeCartItem, updateCartItem, filters } = require('../controllers/productContollers');
const preventRoutes = require('../auth/routesAccessAuth');
const router = express.Router();

router.get('/get-cart-items', preventRoutes, getProductCart);
router.post('/add-cart', preventRoutes, addProductCart);

router.delete('/remove-cart-item/:id', preventRoutes, removeCartItem);
router.patch('/update-cart-item/:id', preventRoutes, updateCartItem);
router.post('/filters', filters)
router.get('/:id', getSingleProduct);

module.exports = router;
