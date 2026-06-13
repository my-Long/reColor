const express = require('express');
const multer  = require('multer');
const cors    = require('cors');
const path    = require('path');
const { analyzeColors, convertTheme, rawReplace } = require('./lib/imageOps');

const app    = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    const colors = await analyzeColors(req.file.buffer);
    res.json({ colors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/convert', upload.single('image'), async (req, res) => {
  try {
    const target = req.body.target;
    if (!['dark', 'light'].includes(target)) return res.status(400).json({ error: 'target must be dark or light' });
    const buf = await convertTheme(req.file.buffer, target);
    res.set('Content-Type', 'image/png');
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/replace', upload.single('image'), async (req, res) => {
  try {
    const pairs = JSON.parse(req.body.pairs);
    const buf = await rawReplace(req.file.buffer, pairs);
    res.set('Content-Type', 'image/png');
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// serve built client in production
app.use(express.static(path.join(__dirname, 'client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`reColor server running on http://localhost:${PORT}`));
