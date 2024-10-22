const Brand = require('../models/brandModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Size = require('../models/sizeModel');

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



const deleteProduct = async (req, res) => {
    const id = req.params.id;
    const response = await Product.deleteOne({ _id: id })
    res.json({ msg: 'One product deleted' })
}

module.exports = { addProduct, getCategory, addCategory, getAllProduct, deleteProduct };
