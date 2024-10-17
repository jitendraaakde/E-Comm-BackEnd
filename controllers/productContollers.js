const Product = require("../models/productModel")
const Cart = require('../models/cartModel')
const mongoose = require('mongoose');

const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('product Id ', id)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'Invalid product ID' });
        }
        const product = await Product.findOne({ _id: id })
            .populate('brand')
            .populate('sizes')
            .populate('category');

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        return res.json({ msg: 'Single product data', product });
    } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({ msg: 'Server error', error });
    }
};



const addProductCart = async (req, res) => {
    const { pid, size, quantity = 1 } = req.body;
    const { userId } = req.user;

    try {
        let cart = await Cart.findOne({ userId });

        if (cart) {
            const existingItem = cart.items.find(item => item.productId.toString() === pid);

            if (existingItem) {
                existingItem.size = size;
                existingItem.quantity += quantity;
            } else {
                cart.items.push({ productId: pid, size, quantity });
            }
        } else {
            cart = new Cart({
                userId,
                items: [{ productId: pid, size, quantity }],
            });
        }

        await cart.save();

        res.status(200).json({ message: 'Product added to cart', cart, success: true });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ message: 'Failed to add product to cart', error });
    }
}

const getProductCart = async (req, res) => {
    const { userId } = req.user
    try {
        const cart = await Cart.findOne({ userId })
        return res.json({ msg: 'product fetch success', cart: cart.items })
    } catch (e) {
        console.log(e)
    }
}

module.exports = { getSingleProduct, addProductCart, getProductCart }