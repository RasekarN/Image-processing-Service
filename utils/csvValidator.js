const fs = require('fs');
const csv = require('csv-parser');

function validateCSV(filePath) {
  const result = { isValid: true, error: null };
  const headers = ['Serial Number', 'Product Name', 'Input Image Urls'];

  return new Promise((resolve, reject) => {
    console.log('Starting CSV validation');
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headerList) => {
        console.log('CSV Headers:', headerList);
        if (headerList.length !== headers.length || !headerList.every((header, index) => header === headers[index])) {
          result.isValid = false;
          result.error = 'Invalid CSV format';
        }
      })
      .on('data', (row) => {
        console.log('Processing row:', row);
      })
      .on('end', () => {
        console.log('CSV validation complete');
        resolve(result);
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });

    const timeoutId = setTimeout(() => {
      if (!result.isValid) {
        console.log('Validation timed out');
        stream.destroy();
        reject(new Error('Validation timed out'));
      }
    }, 10000);

    stream.on('end', () => clearTimeout(timeoutId));
  });
}

module.exports = { validateCSV };
