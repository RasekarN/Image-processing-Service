const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  serialNumber: { type: Number, required: true },
  productName: { type: String, required: true },
  inputImageUrls: { type: [String], required: true },
  processedImageUrls: { type: [String], required: true },
  requestId: { type: String, required: true },
  status: { type: String, required: true, enum: ['pending', 'completed'], default: 'pending' }
});

module.exports = mongoose.model('Product', ProductSchema);
