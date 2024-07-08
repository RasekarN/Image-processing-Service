const fs = require('fs');
const { validateCSV } = require('../utils/csvValidator');

jest.mock('fs');

const mockCSVData = [
  'Serial Number,Product Name,Input Image Urls\n',
  '1,SKU1,https://www.public-image-url1.jpg,https://www.public-image-url2.jpg,https://www.public-image-url3.jpg\n',
  '2,SKU2,https://www.public-image-url1.jpg,https://www.public-image-url2.jpg,https://www.public-image-url3.jpg\n',
].join('');

describe('validateCSV', () => {
  beforeEach(() => {
    fs.createReadStream.mockImplementation(() => {
      const stream = new (require('stream').Readable)();
      stream._read = () => {};
      stream.push(mockCSVData);
      stream.push(null);
      return stream;
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should validate a correct CSV file', async () => {
    const result = await validateCSV('dummy/path/to/file.csv');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should invalidate a CSV file with incorrect headers', async () => {
    fs.createReadStream.mockImplementation(() => {
      const stream = new (require('stream').Readable)();
      stream._read = () => {};
      stream.push('Wrong Header1,Wrong Header2\n');
      stream.push(null);
      return stream;
    });

    const result = await validateCSV('dummy/path/to/file.csv');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid CSV format');
  });
});
