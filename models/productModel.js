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
    discountPrice: {
        type: Number,
        min: 0,
        default: null
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
            required: true // Added required field
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Products', productSchema);
