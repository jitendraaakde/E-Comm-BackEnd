const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    productDesc: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true,
        min: 0
    },
    productStock: {
        type: Number,
        required: true,
        min: 0
    },
    productImages: [{
        type: String,
        required: true
    }],
    productSizes: [{
        type: String
    }],
    productCategory: {
        type: String,
        enum: ['men', 'women', 'children', 'unisex'],
        default: 'unisex'
    },
    productSubCategory: {
        type: String,
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
