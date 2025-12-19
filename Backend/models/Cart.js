const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
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

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
  items: { type: [cartItemSchema], default: [] },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', cartSchema);
