const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./apiRoutes');
const app = express();
app.use(cors({
  origin: ['https://managehouse.vercel.app', 'http://localhost:3000'], // Garder localhost pour vos tests futurs
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// Connexion MySQL (Railway)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise(); // Permet d'utiliser async/await

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('API Node.js fonctionne sur Render !');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
