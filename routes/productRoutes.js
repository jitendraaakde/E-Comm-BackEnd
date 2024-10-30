const express = require('express');
const {
    getSingleProduct,
    addProductCart,
    getProductCart,
    removeCartItem,
    updateCartItem,
    getCategoryBrandSize,
    getProductsByCategory,
    getCategories
} = require('../controllers/productContollers');
const preventRoutes = require('../auth/routesAccessAuth');

const router = express.Router();

// Category-related routes
router.get('/categories', getCategories);
router.get('/categoryProduct/:categoryId', getProductsByCategory);
router.get('/category-brand-size', getCategoryBrandSize);

// Cart-related routes
router.get('/get-cart-items', preventRoutes, getProductCart);
router.post('/add-cart', preventRoutes, addProductCart);
router.delete('/remove-cart-item/:id', preventRoutes, removeCartItem);
router.patch('/update-cart-item/:id', preventRoutes, updateCartItem);

// Product-related routes
router.get('/:id', getSingleProduct);

module.exports = router;
