const mongoose = require('mongoose');

const orderHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orders: [{
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
        orderDate: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('OrderHistory', orderHistorySchema);
