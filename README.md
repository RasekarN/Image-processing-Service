# SDE1 Backend Assignment

## Requirements

1. Validate CSV data is correctly formatted.
2. Asynchronously process images (compressed by 50% of original quality).
3. Store processed image data and associated product information to a database.
4. Provide a unique request ID to the user immediately after file submission.
5. Offer a separate API to check processing status using the request ID.

## Asynchronous Workers Documentation

The `processImages` function in `utils/imageProcessor.js` handles the asynchronous processing of images using the `sharp` library. It compresses the images by 50% of their original quality and saves the processed images to the database.

## Installation

```bash
npm install
