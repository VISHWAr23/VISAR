const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the root directory (e.g., index.html)
app.use(express.static(path.join(__dirname)));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/visar_examination_project', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model('User', userSchema);

// Timetable Schema
const timetableSchema = new mongoose.Schema({
  tableName: { type: String, unique: true },
  data: Object,
});

const Timetable = mongoose.model('Timetable', timetableSchema);

// API endpoint for user registration (signup)
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert user into the database
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error inserting user:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// API endpoint for user login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  try {
    // Query to find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Compare the hashed password with the entered password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // If login is successful, send back user details
    res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// API endpoint to get all timetables
app.get('/api/tables', async (req, res) => {
  try {
    const timetables = await Timetable.find({});
    const tables = timetables.map(timetable => timetable.tableName);
    res.json(tables);
  } catch (err) {
    console.error('Error fetching timetables:', err);
    res.status(500).json({ error: 'Error fetching timetables', details: err.message });
  }
});

// API endpoint to get timetable content
app.get('/api/table/:tableName', async (req, res) => {
  const tableName = req.params.tableName;
  try {
    const timetable = await Timetable.findOne({ tableName });
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    res.json(timetable.data);
  } catch (err) {
    console.error(`Error fetching data from ${tableName}:`, err);
    res.status(500).json({ error: `Error fetching data from ${tableName}`, details: err.message });
  }
});

// API endpoint to store timetable
app.post('/api/store-timetables', async (req, res) => {
  const { tableName, data } = req.body;
  try {
    // Ensure data is an object, not a string
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    const timetable = new Timetable({ tableName, data: parsedData });
    await timetable.save();
    res.status(201).json({ message: 'Timetable stored successfully' });
  } catch (err) {
    console.error('Error storing timetable:', err);
    res.status(500).json({ error: 'Error storing timetable', details: err.message });
  }
});

// Handle root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
