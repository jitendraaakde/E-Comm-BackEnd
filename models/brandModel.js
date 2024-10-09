const mongoose = require('mongoose')
const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true // Added required field
    }
});
module.exports = new mongoose.model('Brand', brandSchema)