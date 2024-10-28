const express = require('express');
const router = express.Router();
const { addProduct, getCategory, addCategory, getAllProduct, deleteProduct, getOrders } = require('../controllers/adminControllers')

router.post('/add-product', addProduct)
router.get('/get-category', getCategory)
router.post('/add-category', addCategory)
router.post('/all-product', getAllProduct)
router.get('/all-product', getAllProduct)
router.get('/get-orders', getOrders)
router.delete('/delete-product/:id', deleteProduct)
module.exports = router;
