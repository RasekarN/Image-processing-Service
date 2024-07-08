const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/product');
const webhookRouter = require('../routes/webhook');

jest.mock('../models/product');

const app = express();
app.use(express.json());
app.use('/webhook', webhookRouter);

describe('POST /webhook/callback', () => {
  it('should return 200 on successful callback processing', async () => {
    Product.updateMany.mockResolvedValue({ nModified: 1 });

    const res = await request(app)
      .post('/webhook/callback')
      .send({
        requestId: 'dummy-request-id',
        status: 'processed',
        processedImageUrls: ['url1', 'url2'],
      });

    expect(res.status).toBe(200);
    expect(res.text).toBe('Callback processed');
  });

  it('should return 500 on internal server error', async () => {
    Product.updateMany.mockRejectedValue(new Error('Internal error'));

    const res = await request(app)
      .post('/webhook/callback')
      .send({
        requestId: 'dummy-request-id',
        status: 'processed',
        processedImageUrls: ['url1', 'url2'],
      });

    expect(res.status).toBe(500);
    expect(res.text).toBe('Internal server error');
  });
});
