const Brand = require('../models/brandModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Size = require('../models/sizeModel');
const Order = require('../models/ordersModel')

const addProduct = async (req, res) => {
    const { brand, categories, sizes, imageUrls, ...productData } = req.body;

    try {
        let brandData = await Brand.findOne({ name: brand });
        if (!brandData) {
            brandData = await Brand.create({ name: brand });
        }

        const categoryIds = [];
        for (let categoryName of categories) {
            let categoryData = await Category.findOne({ name: categoryName });
            if (!categoryData) {
                categoryData = await Category.create({ name: categoryName })
            }
            categoryIds.push(categoryData._id);
        }

        const sizeArr = [];
        for (let size of sizes) {
            let sizeObj = await Size.findOne({ size: size });
            if (!sizeObj) {
                sizeObj = await Size.create({ size })
            }
            sizeArr.push(sizeObj._id);
        }

        const newProduct = new Product({
            ...productData,
            brand: brandData._id,
            category: categoryIds,
            sizes: sizeArr,
            images: imageUrls.map((url) => ({ url }))
        });
        await newProduct.save();
        res.send({ msg: 'Product added successfully', product: newProduct });

    } catch (error) {
        console.error('Error in addProduct:', error);
        res.status(500).send({ msg: 'Failed to add product' });
    }
};
const getCategory = async (req, res) => {
    const categories = await Category.find({})
    res.json({ msg: 'category from back', categories },)
}
const addCategory = async (req, res) => {
    const { name } = req.body;
    const response = await Category.create({ name: name })

    return res.json({ msg: 'category added', name: response.name })
}
const getAllProduct = async (req, res) => {
    const filters = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        let query = {};

        if (filters.Gender) {
            const genderCategories = await Category.find({ name: filters.Gender });
            const genderCategoryIds = genderCategories.map((cat) => cat._id);
            query.category = { $in: genderCategoryIds };
        }

        if (filters.Category) {
            const categories = await Category.find({ name: filters.Category });
            const categoryIds = categories.map((cat) => cat._id);
            query.category = { $in: [...(query.category ? query.category.$in : []), ...categoryIds] };
        }

        if (filters.Brand) {
            const brand = await Brand.findOne({ name: filters.Brand });
            if (brand) query.brand = brand._id;
        }

        if (filters.Size) {
            const size = await Size.findOne({ size: filters.Size });
            if (size) query.sizes = size._id;
        }

        let sortCondition = {};
        switch (filters['Sort By']) {
            case 'Newest Arrivals':
                sortCondition.createdAt = -1;
                break;
            case 'Price: Low to High':
                sortCondition.price = 1;
                break;
            case 'Price: High to Low':
                sortCondition.price = -1;
                break;
            case 'Discount':
                sortCondition.discountPercentage = -1;
                break;
            default:
                break;
        }
        const products = await Product.find(query)
            .populate('brand')
            .populate('sizes')
            .populate('category')
            .skip(skip)
            .limit(limit)
            .sort(sortCondition);

        const totalProducts = await Product.countDocuments(query);

        res.status(200).json({
            products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
};

const getOrders = async (req, res) => {
    try {
        const response = await Order.find({})
            .populate('userId').populate('products.size')
            .populate('products.productId');

        return res.json({ msg: 'order data fetched success', response })
    } catch (error) {
        console.log('Error in order', error)
    }

    return res.json({ msg: 'All the orders' })
}

const editOrderStatus = async (req, res) => {
    const { orderId, newStatus } = req.body;
    try {
        await Order.findByIdAndUpdate(orderId, { orderStatus: newStatus });

        const updatedOrder = await Order.find({})
            .populate('userId')
            .populate('products.size')
            .populate('products.productId');

        if (!updatedOrder) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        return res.json({ msg: 'Order status updated successfully', response: updatedOrder });
    } catch (error) {
        console.log('Error updating order:', error);
        return res.status(500).json({ msg: 'Internal server error' });
    }
};


const deleteProduct = async (req, res) => {
    const id = req.params.id;
    const response = await Product.deleteOne({ _id: id })
    res.json({ msg: 'One product deleted' })
}
const adminDashboardData = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        const orders = await Order.find({}).populate('products.productId');

        const totalRevenue = orders.reduce((sum, order) => {
            return sum + order.products.reduce((orderSum, product) => {
                return orderSum + product.amount * product.quantity;
            }, 0);
        }, 0);

        const monthlySales = {};

        orders.forEach((order) => {
            const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
            const year = new Date(order.createdAt).getFullYear();
            const monthYear = `${month} ${year}`;

            if (!monthlySales[monthYear]) monthlySales[monthYear] = 0;

            order.products.forEach((product) => {
                monthlySales[monthYear] += product.amount * product.quantity;
            });
        });

        const salesData = Object.keys(monthlySales).map((month) => ({
            name: month,
            sales: monthlySales[month],
        }));

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newProductsThisWeek = await Product.countDocuments({ createdAt: { $gte: oneWeekAgo } });

        res.json({
            stats: {
                totalProducts,
                totalOrders,
                totalRevenue,
                newProductsThisWeek,
            },
            salesData,
        });
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
};


module.exports = { addProduct, getCategory, addCategory, getAllProduct, deleteProduct, getOrders, editOrderStatus, adminDashboardData };
