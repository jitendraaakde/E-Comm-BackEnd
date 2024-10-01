const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true,
        unique: true
    },
    userPasswordHash: {
        type: String,
        required: true
    }, phoneNumber: {
        type: Number,
        required: false,
        unique: true
    },
    role: {
        type: String,
        default: 'user'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
