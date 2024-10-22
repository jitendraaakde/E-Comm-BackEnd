const express = require('express');
const { getSingleProduct, addProductCart, getProductCart, removeCartItem, updateCartItem, getCategoryBrandSize } = require('../controllers/productContollers');
const preventRoutes = require('../auth/routesAccessAuth');
const router = express.Router();

router.get('/get-cart-items', preventRoutes, getProductCart);
router.post('/add-cart', preventRoutes, addProductCart);
router.get('/category-brand-size', getCategoryBrandSize)
router.get('/:id', getSingleProduct);
router.delete('/remove-cart-item/:id', preventRoutes, removeCartItem);
router.patch('/update-cart-item/:id', preventRoutes, updateCartItem);

module.exports = router;
