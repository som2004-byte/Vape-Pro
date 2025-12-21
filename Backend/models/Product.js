const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be a positive number']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        // Basic URL validation for image URLs
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: props => `${props.value} is not a valid image URL`
    }
  }],
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: {
      values: [
        'disposable',
        'pod-systems',
        'starter-kits',
        'mods',
        'tanks',
        'coils',
        'e-liquids',
        'accessories'
      ],
      message: 'Please select a valid category'
    }
  },
  brand: {
    type: String,
    required: [true, 'Product brand is required']
  },
  flavor: {
    type: String,
    default: ''
  },
  nicotineStrength: {
    type: Number,
    min: 0,
    max: 50
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  numReviews: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  specifications: {
    type: Map,
    of: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for product URL
productSchema.virtual('url').get(function() {
  return `/products/${this._id}`;
});

// Create text index for search
productSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  category: 'text',
  flavor: 'text'
});

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ isFeatured: true, isActive: true })
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
};

// Instance method to update stock
productSchema.methods.updateStock = async function(quantity, action = 'decrement') {
  if (action === 'decrement') {
    if (this.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
  } else if (action === 'increment') {
    this.stock += quantity;
  } else {
    throw new Error('Invalid action. Use "increment" or "decrement".');
  }
  
  return this.save();
};

// Pre-save hook to generate SKU if not provided
productSchema.pre('save', async function(next) {
  if (!this.sku) {
    const count = await this.constructor.countDocuments();
    this.sku = `PRD-${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
