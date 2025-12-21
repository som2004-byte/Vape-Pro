const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    flavor: { type: String, default: '' },
    series: { type: String, default: '' },
    quantity: { type: Number, default: 1, min: 1 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  items: { type: [orderItemSchema], default: [] },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'cod'], default: 'cod' },
  paymentMethod: { type: String, default: 'cod' },
  shippingAddress: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
