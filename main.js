const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow all origins
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-memory database simulation (use a real database in production)
let posts = [];
const dataFile = 'posts.json';

// Load existing posts from file
if (fs.existsSync(dataFile)) {
    posts = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Endpoint to get all posts
app.get('/posts', (req, res) => {
    res.json(posts);
});

// Endpoint to create a new text post
app.post('/posts', (req, res) => {
    const { name, text } = req.body;
    if (!name || !text) {
        return res.status(400).send('Name and text are required');
    }
    const newPost = { id: Date.now(), name, text, type: 'text' };
    posts.push(newPost);
    savePosts();
    res.json(newPost);
});

// Endpoint to upload a file and create a file post
app.post('/upload', upload.single('file'), (req, res) => {
    const { name } = req.body;
    if (!name || !req.file) {
        return res.status(400).send('Name and file are required');
    }
    const newPost = {
        id: Date.now(),
        name,
        fileUrl: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
        type: 'file',
    };
    posts.push(newPost);
    savePosts();
    res.json(newPost);
});

// Save posts to file
function savePosts() {
    fs.writeFileSync(dataFile, JSON.stringify(posts, null, 2));
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
