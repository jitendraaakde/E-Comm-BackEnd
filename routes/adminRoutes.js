const express = require('express');
const router = express.Router();
const { addProduct, getCategory, addCategory, getAllProduct, deleteProduct } = require('../controllers/adminControllers')

router.post('/add-product', addProduct)
router.get('/get-category', getCategory)
router.post('/add-category', addCategory)
router.get('/all-product', getAllProduct)
router.delete('/delete-product/:id', deleteProduct)
module.exports = router;
