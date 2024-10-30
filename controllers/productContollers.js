const Product = require("../models/productModel")
const Cart = require('../models/cartModel')
const mongoose = require('mongoose');
const Size = require("../models/sizeModel");
const Category = require('../models/categoryModel')
const Brand = require('../models/brandModel')


const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.params;
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
            const sizeId = size._id ? size._id.toString() : size.toString();

            const existingItem = cart.items.find(
                item =>
                    item.productId.toString() === pid &&
                    item.size.toString() === sizeId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({ productId: pid, size: sizeId, quantity });
            }
        } else {
            cart = new Cart({
                userId,
                items: [{ productId: pid, size: size._id || size, quantity }],
            });
        }

        await cart.save();

        const populatedCart = await Cart.findOne({ userId })
            .populate('items.size')
            .populate({
                path: 'items.productId',
                populate: [{ path: 'brand' }, { path: 'sizes' }],
            });

        res.status(200).json({
            message: 'Product added to cart',
            cart: populatedCart,
            success: true,
        });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({
            message: 'Failed to add product to cart',
            error,
        });
    }
};

const getProductCart = async (req, res) => {
    const { userId } = req.user
    if (!userId) {
        return res.json({ msg: 'user not logged in' })
    }
    try {
        const cart = await Cart.findOne({ userId })
            .populate('items.size')
            .populate({
                path: 'items.productId',
                populate: [
                    { path: 'brand' },
                    { path: 'sizes' }
                ]
            })
        if (!cart) {
            return res.json({ msg: 'cart is empty' })
        }
        return res.json({ msg: 'product fetch success', cart: cart.items })
    } catch (e) {
        console.log(e)
    }
}

const removeCartItem = async (req, res) => {
    const { userId } = req.user;
    const { id: productId } = req.params;

    try {
        let cart = await Cart.findOne({ userId }).populate('items.size')
            .populate({
                path: 'items.productId',
                populate: [
                    { path: 'brand' },
                    { path: 'sizes' }
                ]
            });


        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemToRemove = cart.items.find(item => item._id.toString() === productId);
        if (!itemToRemove) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== productId);

        await cart.save();

        const updatedCart = await Cart.findOne({ userId })
            .populate('items.size')
            .populate({
                path: 'items.productId',
                populate: [
                    { path: 'brand' },
                    { path: 'sizes' }
                ]
            });

        res.status(200).json({
            message: 'Item deleted from cart',
            cart: updatedCart.items,
        });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ message: 'Failed to remove item from cart', error });
    }
};
const updateCartItem = async (req, res) => {
    const { userId } = req.user;
    const { id } = req.params;
    const { property, value } = req.body;
    try {
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        const item = cart.items.find(item => item._id.toString() === id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (property === 'quantity') {
            if (value < 1) {
                return res.status(400).json({ message: 'Quantity must be at least 1' });
            }
            item.quantity = value;
        } else if (property === 'size') {
            try {
                const selectedSizeId = new mongoose.Types.ObjectId(value);

                const sizeObject = await Size.findById(selectedSizeId);
                if (!sizeObject) {
                    return res.status(404).json({ message: 'Size not found' });
                }
                item.size = sizeObject;
                await cart.save();
            } catch (error) {
                console.error('Error updating size:', error);
                return res.status(500).json({ message: 'Failed to update size', error });
            }
        }


        await cart.save();

        const updatedCart = await Cart.findOne({ userId })
            .populate('items.size')
            .populate({
                path: 'items.productId',
                populate: [
                    { path: 'brand' },
                    { path: 'sizes' }
                ]
            });

        res.status(200).json({
            message: 'Cart updated successfully',
            cart: updatedCart.items,
        });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Failed to update cart item', error });
    }
};


const getCategoryBrandSize = async (req, res) => {
    try {
        const categories = await Category.find({});
        const brands = await Brand.find({});
        const sizes = await Size.find({});

        return res.status(200).json({
            msg: 'Data fetch successful',
            categories,
            brands,
            sizes
        });
    } catch (error) {
        console.error('Error fetching categories, brands, and sizes:', error);
        return res.status(500).json({
            msg: 'Failed to fetch data',
            error: error.message || 'Internal Server Error'
        });
    }
}

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
    }
};

const getProductsByCategory = async (req, res) => {
    console.log('Get Product by category');
    const { categoryId } = req.params;

    try {
        console.log('Fetching products for categoryId:', categoryId);
        const products = await Product.find({ category: categoryId })
            .populate('brand', 'name')
            .populate('sizes', 'size');

        console.log('Fetched products:', products);
        res.status(200).json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products', error });
    }
};

module.exports = { getSingleProduct, addProductCart, getProductCart, removeCartItem, updateCartItem, getCategoryBrandSize, getProductsByCategory, getCategories }