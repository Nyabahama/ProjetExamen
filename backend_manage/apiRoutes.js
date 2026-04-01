const express = require('express');
const router = express.Router();
const ctrl = require('./apiController');

// Routes dynamiques
router.post('/login', ctrl.login);
router.get('/dashboard/:id_menage', ctrl.getDashboard);
router.get('/:entity/:id_menage', ctrl.getEntities);
router.post('/manage/:entity', ctrl.manageEntity);
router.get('/menages', ctrl.getEntities); // Liste globale pour le selecteur

module.exports = router;