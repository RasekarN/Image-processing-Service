const express = require('express');
const Product = require('../models/product');

const router = express.Router();

router.post('/callback', async (req, res) => {
  const { requestId, status, processedImageUrls } = req.body;

  try {
    await Product.updateMany(
      { requestId },
      { status, processedImageUrls }
    );
    res.status(200).send('Callback processed');
  } catch (error) {
    console.error('Error processing callback:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
