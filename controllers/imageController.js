const { validateCSV } = require('../utils/csvValidator');
const { processImages } = require('../utils/imageProcessor');
const Product = require('../models/product');
const { v4: uuidv4 } = require('uuid');

const uploadController = async (req, res) => {
  try {
    const filePath = req.file.path;
    const csvData = await validateCSV(filePath);

    const requestId = uuidv4();
    const productPromises = csvData.map(async (row) => {
      const processedImageUrls = await processImages([row['Input Image Urls'], row._3, row._4], requestId);
      return new Product({
        serialNumber: row['Serial Number'],
        productName: row['Product Name'],
        inputImageUrls: [row['Input Image Urls'], row._3, row._4],
        processedImageUrls,
        requestId,
        status: 'completed'
      }).save();
    });

    await Promise.all(productPromises);
    res.status(200).json({ requestId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { uploadController };
