const sharp = require('sharp');
const path = require('path');

const processImages = async (inputUrls, requestId) => {
  const processedUrls = [];

  for (const url of inputUrls) {
    const outputPath = path.join(__dirname, '..', 'uploads', `${requestId}-${path.basename(url)}`);
    await sharp(url)
      .resize({ width: 500 })
      .toFile(outputPath);
    processedUrls.push(outputPath);
  }

  return processedUrls;
};

module.exports = { processImages };
