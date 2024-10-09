const express = require('express');
const router = express.Router();
const { addProduct, getCategory, addCategory } = require('../controllers/adminControllers')

router.post('/add-product', addProduct)
router.get('/get-category', getCategory)
router.get('/add-category', addCategory)

module.exports = router;
