const { Schema, default: mongoose } = require("mongoose");

const addressSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    userAddresses: [{
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    }],
})