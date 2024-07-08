const express = require('express');
const multer = require('multer');
const uploadRoute = require('./routes/upload');
const statusRoute = require('./routes/status');
const connectDB = require('./database');
const webhookRouter = require('./routes/webhook');
const swaggerSetup = require('./swagger');

const app = express();
const PORT = 3000;

connectDB();
swaggerSetup(app);

app.use('/webhook', webhookRouter);
app.use(express.json());
app.use('/upload', uploadRoute);
app.use('/status', statusRoute);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app;
