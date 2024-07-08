const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { validateCSV } = require('../utils/csvValidator');
const { processImages } = require('../utils/imageProcessor');
const Product = require('../models/product');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  console.log('Received a file upload request');
  const file = req.file;
  if (!file) {
    console.log('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    console.log('Validating CSV file');
    const validationResult = await validateCSV(file.path);
    if (!validationResult.isValid) {
      console.log('Invalid CSV file', validationResult.error);
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: validationResult.error });
    }

    const requestId = uuidv4();
    console.log('CSV file is valid, processing the file');

    const productPromises = validationResult.data.map(async (row) => {
      const processedImageUrls = await processImages(
        [row['Input Image Urls'], row._3, row._4],
        requestId
      );
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

    fs.unlinkSync(file.path);
    console.log('File processed successfully', requestId);
    res.status(200).json({ requestId });
  } catch (error) {
    console.error('Error processing file:', error);
    fs.unlinkSync(file.path);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
