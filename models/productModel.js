const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discountPercentage: {
        type: Number,
        min: 0,
        default: 0
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 1
    },
    images: [
        {
            url: { type: String, required: true },
        }
    ],
    sizes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Size'
        }
    ],
    category: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
