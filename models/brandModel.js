const { Schema, Model, default: mongoose } = require('mongoose');

const brandSchema = new Schema({
    name: {
        type: String
    }
})
module.exports = mongoose.model('Brand', brandSchema);
