const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// DB connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'weather_app'
});

// Search & store history
app.post('/search', (req, res) => {
  const { city } = req.body;
  const timestamp = new Date();

  db.query(
    'INSERT INTO search_history (city, timestamp) VALUES (?, ?)',
    [city, timestamp],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save history' });
      res.status(200).json({ message: 'Saved' });
    }
  );
});

// Get recent history
app.get('/history', (req, res) => {
  db.query('SELECT * FROM search_history ORDER BY timestamp DESC', (err, result) => {
    if (err) return res.status(500).json({ error: 'Fetch error' });
    res.json(result);
  });
});


app.delete("/api/history", (req, res) => {
  const sql = "DELETE FROM search_history";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error clearing history:", err);
      return res.status(500).send("Server error");
    }
    res.status(200).send("Search history cleared");
  });
});


// Start server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
