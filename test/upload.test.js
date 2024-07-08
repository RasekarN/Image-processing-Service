const request = require('supertest');
const express = require('express');
const multer = require('multer');
const { validateCSV } = require('../utils/csvValidator');
const Product = require('../models/product');
const { processImages } = require('../utils/imageProcessor');

jest.mock('../utils/csvValidator');
jest.mock('../models/product');
jest.mock('../utils/imageProcessor');

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const validationResult = await validateCSV(file.buffer);
    if (!validationResult.isValid) {
      return res.status(400).json({ error: validationResult.error });
    }

    const requestId = 'dummy-request-id';
    const productPromises = validationResult.data.map(async (row) => {
      const processedImageUrls = await processImages(
        [row['Input Image Urls']],
        requestId
      );
      return new Product({
        serialNumber: row['Serial Number'],
        productName: row['Product Name'],
        inputImageUrls: [row['Input Image Urls']],
        processedImageUrls,
        requestId,
        status: 'completed'
      }).save();
    });

    await Promise.all(productPromises);

    res.status(200).json({ requestId });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const mockCSVData = [
  'Serial Number,Product Name,Input Image Urls\n',
  '1,SKU1,https://www.public-image-url1.jpg\n',
  '2,SKU2,https://www.public-image-url2.jpg\n',
].join('');

describe('POST /upload', () => {
  it('should return 400 if no file is uploaded', async () => {
    const res = await request(app).post('/upload');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('No file uploaded');
  });

  it('should return 400 if the CSV file is invalid', async () => {
    validateCSV.mockResolvedValue({ isValid: false, error: 'Invalid CSV format' });

    const res = await request(app)
      .post('/upload')
      .attach('file', Buffer.from(mockCSVData), 'test.csv');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid CSV format');
  }, 10000);

  it('should return 200 if the CSV file is valid', async () => {
    validateCSV.mockResolvedValue({
      isValid: true,
      error: null,
      data: [
        { 'Serial Number': '1', 'Product Name': 'SKU1', 'Input Image Urls': 'https://www.public-image-url1.jpg' },
        { 'Serial Number': '2', 'Product Name': 'SKU2', 'Input Image Urls': 'https://www.public-image-url2.jpg' }
      ]
    });
    processImages.mockResolvedValue(['processed-url1', 'processed-url2']);
    Product.prototype.save.mockResolvedValue();

    const res = await request(app)
      .post('/upload')
      .attach('file', Buffer.from(mockCSVData), 'test.csv');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('requestId');
  }, 10000);

  it('should return 500 if there is a server error', async () => {
    validateCSV.mockImplementation(() => {
      throw new Error('Internal server error');
    });

    const res = await request(app)
      .post('/upload')
      .attach('file', Buffer.from(mockCSVData), 'test.csv');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  }, 10000);
});
