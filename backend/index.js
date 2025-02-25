const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: [
        'https://just-pong.vercel.app',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
}));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // for Railway
  },
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Database connection error:', err));

// Ensure table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS highscores (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL
  );
`);

// Get top 10 high scores
app.get("/api/highscores", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM highscores ORDER BY score DESC LIMIT 10"
    );
    console.log("Sending high scores:", rows); // Debug log
    res.json(rows);
  } catch (err) {
    console.error("Error fetching high scores:", err);
    res.status(500).json({ error: err.message });
  }
});

// Submit a new high score
app.post("/api/highscores", async (req, res) => {
  const { player_name, score } = req.body;
  try {
    console.log("Received score submission:", { player_name, score }); // Debug log
    const result = await pool.query(
      "INSERT INTO highscores (player_name, score) VALUES ($1, $2) RETURNING *",
      [player_name, score]
    );
    console.log("Inserted score:", result.rows[0]); // Debug log
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error saving score:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Backend server running on port 5000"));
