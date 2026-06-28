require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Setup MySQL database pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sustaincity',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Setup Table
const initDb = () => {
    pool.query(`
        CREATE TABLE IF NOT EXISTS players (
            id INT AUTO_INCREMENT PRIMARY KEY,
            playerName VARCHAR(255) NOT NULL UNIQUE,
            score INT DEFAULT 0,
            envScore FLOAT DEFAULT 50,
            socialScore FLOAT DEFAULT 50,
            economyScore FLOAT DEFAULT 50,
            knowledgeScore INT DEFAULT 0,
            playTime FLOAT DEFAULT 0,
            reflectionAnswers TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating MySQL table:', err.message);
            console.log('Pastikan MySQL Server menyala dan database "sustaincity" (atau sesuai .env) sudah dibuat.');
        } else {
            console.log('Connected to MySQL database and verified table structure.');
        }
    });
};

initDb();

// API: Get Levels
app.get('/api/levels', (req, res) => {
    const levelsPath = path.join(__dirname, 'levels.json');
    if (fs.existsSync(levelsPath)) {
        const data = fs.readFileSync(levelsPath, 'utf8');
        res.json(JSON.parse(data));
    } else {
        res.status(404).json({ error: 'levels.json not found' });
    }
});

// API: Update Levels
app.post('/api/levels', (req, res) => {
    const levelsPath = path.join(__dirname, 'levels.json');
    try {
        fs.writeFileSync(levelsPath, JSON.stringify(req.body, null, 2));
        res.json({ message: 'Levels updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Submit Player Data
app.post('/api/players', (req, res) => {
    const { playerName, score, envScore, socialScore, economyScore, knowledgeScore, playTime, reflectionAnswers } = req.body;

    if (!playerName) {
        return res.status(400).json({ error: 'playerName is required' });
    }

    const reflectionJson = reflectionAnswers ? JSON.stringify(reflectionAnswers) : null;

    // Use MySQL ON DUPLICATE KEY UPDATE for efficient Upsert
    const sql = `
        INSERT INTO players (playerName, score, envScore, socialScore, economyScore, knowledgeScore, playTime, reflectionAnswers)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            score = VALUES(score),
            envScore = VALUES(envScore),
            socialScore = VALUES(socialScore),
            economyScore = VALUES(economyScore),
            knowledgeScore = VALUES(knowledgeScore),
            playTime = VALUES(playTime),
            reflectionAnswers = VALUES(reflectionAnswers)
    `;

    const params = [
        playerName,
        score || 0,
        envScore || 50,
        socialScore || 50,
        economyScore || 50,
        knowledgeScore || 0,
        playTime || 0,
        reflectionJson
    ];

    pool.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Player data saved or updated', id: results.insertId });
    });
});

// API: Get Player Leaderboard
app.get('/api/players', (req, res) => {
    const sql = `SELECT * FROM players ORDER BY knowledgeScore DESC, envScore DESC`;
    pool.query(sql, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// API: Clear All Player Data
app.delete('/api/players', (req, res) => {
    pool.query(`TRUNCATE TABLE players`, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Semua data pemain berhasil dihapus.' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
