const mongoose = require('mongoose')
const brandSchema = new Schema({
    name: {
        type: String,
        required: true // Added required field
    }
});
module.exports = new mongoose.model('Brand', brandSchema)