const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Configuration PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'aegis_user',
  password: process.env.DB_PASSWORD || 'aegis_secret_pass',
  database: process.env.DB_NAME || 'aegis_db',
});

// Endpoint Healthcheck (Utilisé par le Cloud & Kubernetes)
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'UP',
      timestamp: result.rows[0].now,
      service: 'AEGIS Secure API'
    });
  } catch (err) {
    res.status(500).json({
      status: 'DOWN',
      error: 'Database connection failed'
    });
  }
});

// Endpoint d'Authentification simulé
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    return res.json({ token: 'mock-jwt-token-aegis-12345', status: 'authenticated' });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Endpoint d'Incidents de sécurité
app.get('/api/v1/incidents', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM incidents ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ VERSION SÉCURISÉE : Requête paramétrée contre les injections SQL (OWASP A03)
app.get('/api/v1/incidents/search', async (req, res) => {
  const { title } = req.query;
  if (!title) {
    return res.status(400).json({ error: 'Title query parameter is required' });
  }
  
  // Utilisation de $1 pour neutraliser tout code SQL malveillant
  const query = 'SELECT * FROM incidents WHERE title = $1';
  try {
    const result = await pool.query(query, [title]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Initialisation des tables au démarrage si nécessaire
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        severity VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'OPEN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database table "incidents" ready.');
  } catch (err) {
    console.error('DB Init Error:', err.message);
  }
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, async () => {
    console.log(`AEGIS API listening on port ${port}`);
    await initDB();
  });
}

module.exports = app;
