const Brand = require('../models/brandModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Size = require('../models/sizeModel');

const addProduct = async (req, res) => {
    console.log('Form data which comes', req.body);
    const { brand, categories, sizes, imageUrls, ...productData } = req.body;

    try {
        let brandData = await Brand.findOne({ name: brand });
        if (!brandData) {
            brandData = await Brand.create({ name: brand });
        }

        //  Handle Categories
        const categoryIds = [];
        for (let categoryName of categories) {
            let categoryData = await Category.findOne({ name: categoryName });
            if (!categoryData) {
                categoryData = await Category.create({ name: categoryName })
            }
            categoryIds.push(categoryData._id);
        }

        //  Handle Sizes
        const sizeArr = [];
        for (let size of sizes) {
            let sizeObj = await Size.findOne({ size: size });
            if (!sizeObj) {
                sizeObj = await Size.create({ size })
            }
            sizeArr.push(sizeObj._id);
        }

        //  Create the product
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
    console.log(req.body)
    // const res = await Category.create({ name:})
    res.json({ msg: 'category added' })
}

module.exports = { addProduct, getCategory, addCategory };
