const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: null
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    isVerified: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('User', userSchema);
