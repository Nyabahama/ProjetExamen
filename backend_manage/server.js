require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./apiRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Utilisation des routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});