const { Schema, default: mongoose } = require("mongoose");

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Category', categorySchema);
