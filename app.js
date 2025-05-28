require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI, {
  user: process.env.MONGO_USERNAME,
  pass: process.env.MONGO_PASSWORD,
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB Connection Successful');
}).catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

const dataSchema = new mongoose.Schema({
  name: String,
  id: Number,
  description: String,
  image: String,
  velocity: String,
  distance: String
});

const planetModel = mongoose.model('planets', dataSchema);

app.post('/planet', async (req, res) => {
  const planetId = parseInt(req.body.id, 10);
  if (isNaN(planetId) || planetId < 0 || planetId > 9) {
    return res.status(400).json({ error: 'Invalid planet id. Select a number from 0 - 9' });
  }

  try {
    const planetData = await planetModel.findOne({ id: planetId });
    if (!planetData) {
      return res.status(404).json({ error: 'Planet not found' });
    }
    res.json(planetData);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api-docs', (req, res) => {
  fs.readFile(path.join(__dirname, 'oas.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).send('Error reading file');
    } else {
      res.json(JSON.parse(data));
    }
  });
});

app.get('/os', (req, res) => {
  res.json({
    os: OS.hostname(),
    env: process.env.NODE_ENV
  });
});

app.get('/live', (req, res) => {
  res.json({ status: 'live' });
});

app.get('/ready', (req, res) => {
  res.json({ status: 'ready' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server successfully running on port - ${PORT}`);
});

module.exports = app;
// module.exports.handler = serverless(app);
