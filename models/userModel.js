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
    },
    role: {
        type: String,
        default: 'user'
    },
    userAddresses: [{
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
