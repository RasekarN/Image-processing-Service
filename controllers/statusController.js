const Product = require('../models/product');

const statusController = async (req, res) => {
  try {
    const { requestId } = req.params;
    const product = await Product.findOne({ requestId });

    if (!product) {
      return res.status(404).json({ error: 'Request ID not found' });
    }

    res.status(200).json({ status: product.status, processedImageUrls: product.processedImageUrls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { statusController };
