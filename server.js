const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/hindiPoemsDB')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));
  
  app.use(express.static(path.join(__dirname, 'poemExpress')));

//   // Root route (for homepage)
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'reader.html'));
  });

//   // Poet route (for poet dashboard)
app.get('/poet', (req, res) => {
    res.sendFile(path.join(__dirname, 'poet.html'));
  });
  
//   // Reader route (for reader side)
  app.get('/reader', (req, res) => {
    res.sendFile(path.join(__dirname , 'reader.html'));
  });

// Poem Schema
const poemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    backgroundImage: { type: String, default: '' },
  });
  

const Poem = mongoose.model('Poem', poemSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Multer Setup for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Poet Side: Upload Poem
app.post('/uploadPoem', upload.single('backgroundImage'), async (req, res) => {
    try {
      const { title, content } = req.body;
  
      // Check if a file was uploaded
      let backgroundImage = '';
      if (req.file) {
        backgroundImage = `/uploads/${req.file.filename}`;
      }
  
      // Save to MongoDB
      const newPoem = new Poem({
        title,
        content,
        backgroundImage,
      });
      await newPoem.save();
  
      res.json({ message: 'कविता सफलतापूर्वक अपलोड की गई!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'कविता अपलोड करने में त्रुटि हुई।' });
    }
  });
  

// Reader Side: Get All Poems
app.get('/poems', async (req, res) => {
  const poems = await Poem.find();
  res.json(poems);
});

  

// Server Listening
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
