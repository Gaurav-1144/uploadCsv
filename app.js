const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const port = 3000;

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  // Read the list of uploaded CSV files
  fs.readdir('./uploads/', (err, files) => {
    console.log(files);
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.render('index', { files });
  });
});

app.post('/upload', upload.single('csvFile'), (req, res) => {
  res.redirect('/');
});

app.get('/view/:filename', (req, res) => {
  const filename = req.params.filename;
  const rows = [];

  fs.createReadStream(`./uploads/${filename}`)
    .pipe(csv())
    .on('data', (row) => {
      rows.push(row);
    })
    .on('end', () => {
      // Render the data in a table
      res.render('view', { filename, rows });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});