const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/product');
const statusRouter = require('../routes/status');

jest.mock('../models/product');

const app = express();
app.use(express.json());
app.use('/status', statusRouter);

describe('GET /status/:requestId', () => {
  it('should return 404 if requestId is not found', async () => {
    Product.findOne.mockResolvedValue(null);

    const res = await request(app).get('/status/nonexistent-request-id');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Request ID not found');
  });

  it('should return 200 and status if requestId is found', async () => {
    Product.findOne.mockResolvedValue({
      requestId: 'dummy-request-id',
      status: 'processing',
    });

    const res = await request(app).get('/status/dummy-request-id');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('processing');
  });
});
