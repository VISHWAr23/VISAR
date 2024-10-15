const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '&Vishwa05&',
  database: 'visar_examination_project',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// API endpoint for user registration (signup)
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  // Hash the password before saving it to the database
  const hashedPassword = await bcrypt.hash(password, 10);
  // Insert user into the database
  const insertSQL = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(insertSQL, [name, email, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// API endpoint for user login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  // Query to find the user by email
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = results[0];
    // Compare the hashed password with the entered password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // If login is successful, send back user details
    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
  });
});

// API endpoint to get all tables
app.get('/api/tables', (req, res) => {
  const query = `
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = ?
  `;
  
  db.query(query, [db.config.connectionConfig.database], (err, results) => {
    if (err) {
      console.error('Error fetching tables:', err);
      return res.status(500).json({ error: 'Error fetching tables', details: err.message });
    }
    const tables = results.map(row => row.TABLE_NAME);
    console.log(tables);
    res.json(tables);
  });
});

// API endpoint to get table content
app.get('/api/table/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  const query = `SELECT * FROM ${tableName}`;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error(`Error fetching data from ${tableName}:`, err);
      return res.status(500).json({ error: `Error fetching data from ${tableName}`, details: err.message });
    }
    res.json(results);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
