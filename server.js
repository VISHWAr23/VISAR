const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '&Vishwa05&',
  database: 'visar_examination_project',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create the connection pool
const pool = mysql.createPool(dbConfig);

// API endpoint for user registration (signup)
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
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
    const [results] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// API endpoint to get all tables
app.get('/api/tables', async (req, res) => {
  try {
    const [results] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME != 'users'
    `, [dbConfig.database]);

    const tables = results.map(row => row.TABLE_NAME);
    res.json(tables);
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ error: 'Error fetching tables', details: err.message });
  }
});

// API endpoint to get table content
app.get('/api/table/:tableName', async (req, res) => {
  const tableName = req.params.tableName;
  try {
    // Ensure the tableName is a valid identifier to prevent SQL injection
    const escapedTableName = mysql.escapeId(tableName);
    const [results] = await pool.execute(`SELECT * FROM ${escapedTableName}`);
    res.json(results);
  } catch (err) {
    console.error(`Error fetching data from ${tableName}:`, err);
    res.status(500).json({ error: `Error fetching data from ${tableName}`, details: err.message });
  }
});

// API endpoint to delete a timetable
app.delete('/api/delete-timetable', async (req, res) => {
  try {
    const { tableName } = req.body;
    
    if (!tableName) {
      return res.status(400).json({ success: false, message: 'Table name is required' });
    }

    const escapedTableName = mysql.escapeId(tableName);  // Escape the table name
    await pool.execute(`DROP TABLE IF EXISTS ${escapedTableName}`);
    
    res.json({ success: true, message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete table', error: error.message });
  }
});

// API endpoint to dynamically store timetable data into a specified table
// API endpoint to dynamically store timetable data into a specified table
app.post('/api/store-timetables', async (req, res) => {
  const { tableName, data } = req.body;

  if (!tableName || !data) {
    return res.status(400).json({ error: 'Missing tableName or data' });
  }

  let timetable;
  try {
    timetable = JSON.parse(data);
    // Ensure timetable is an object and contains the required properties
    if (typeof timetable !== 'object' || !timetable.subjects || !Array.isArray(timetable.subjects)) {
      throw new Error('Parsed data is not a valid timetable object');
    }
  } catch (error) {
    console.error('Invalid JSON data:', error);
    return res.status(400).json({ error: 'Invalid JSON data', details: error.message });
  }

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS ${mysql.escapeId(tableName)} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      exam_start_date DATE,
      subject_name VARCHAR(255),
      staff_name VARCHAR(255),
      staff_email VARCHAR(255),
      subject_completion FLOAT
    )
  `;

  try {
    await pool.query(createTableSQL); // Use pool.query instead of dbConfig.query

    const insertSQL = `
      INSERT INTO ${mysql.escapeId(tableName)} 
      (exam_start_date, subject_name, staff_name, staff_email, subject_completion) 
      VALUES ?
    `;

    const values = timetable.subjects.map(subject => [
      new Date(timetable.examStartDate), // Ensure this date is valid
      subject.subjectName,
      subject.staffName,
      subject.staffEmail,
      subject.subjectCompletion
    ]);

    // Check if values is empty
    if (values.length === 0) {
      return res.status(400).json({ error: 'No valid data to insert' });
    }

    const [result] = await pool.query(insertSQL, [values]); // Use pool.query

    res.json({ message: 'Data stored successfully', affectedRows: result.affectedRows });
  } catch (err) {
    console.error('Error storing data:', err);
    res.status(500).json({ error: 'Error storing data', details: err.message });
  }
});


// Helper function to get stored exam data
app.get('/api/exam-data', async (req, res) => {
  try {
    const [results] = await pool.execute(`
      SELECT 
        es.exam_start_date,
        sub.staff_name,
        sub.subject_name,
        sub.staff_email,
        sub.subject_completion
      FROM exam_sessions es
      JOIN exam_subjects sub ON es.id = sub.exam_session_id
      ORDER BY sub.subject_completion DESC
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error('Error fetching exam data:', err);
    res.status(500).json({ 
      error: 'Database error', 
      details: err.message 
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
