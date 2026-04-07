const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Configuration de la base de données
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Route de Login
router.post('/auth/login', (req, res) => {
    const { nom, nomFamille } = req.body;
    const sql = `
        SELECT p.id_personne, p.nom, p.prenom, f.id_famille, f.nom_famille, f.id_menage 
        FROM personne p 
        JOIN famille f ON p.id_famille = f.id_famille 
        WHERE p.nom = ? AND f.nom_famille = ?
        LIMIT 1
    `;
    db.query(sql, [nom, nomFamille], (err, result) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la connexion à la base de données." });
        if (result.length > 0) {
            res.json({ user: result[0] });
        } else {
            res.status(401).json({ error: "Utilisateur non trouvé. Vérifiez vos identifiants." });
        }
    });
});

// Route d'inscription (création famille et personne si nécessaire)
router.post('/auth/register', (req, res) => {
    const {
        pays, ville, commune, quartier, avenue, numero_avenue,
        nomFamille,
        nom, prenom, date_naissance, sexe, statut_familial, telephone, email
    } = req.body;

    if (!nom || !nomFamille) return res.status(400).json({ error: 'Nom et nom de famille requis' });

    // 1. Création du Ménage
    db.query('SELECT COALESCE(MAX(id_menage), 0) + 1 AS nextId FROM menage', (err, rows) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la génération de l'ID ménage." });
        const nextMenageId = rows[0].nextId;

        db.query('CALL proc_gestion_menage(?, ?, ?, ?, ?, ?, ?, ?)',
            ['INSERT', nextMenageId, pays, ville, commune, quartier, avenue, numero_avenue], (err2) => {
                if (err2) return res.status(500).json({ error: "Erreur lors de l'enregistrement du ménage." });

                // 2. Création de la Famille
                db.query('SELECT COALESCE(MAX(id_famille), 0) + 1 AS nextId FROM famille', (err3, rows2) => {
                    if (err3) return res.status(500).json({ error: "Erreur lors de la génération de l'ID famille." });
                    const nextFamId = rows2[0].nextId;

                    db.query('CALL proc_gestion_famille(?, ?, ?, ?)',
                        ['INSERT', nextFamId, nextMenageId, nomFamille], (err4) => {
                            if (err4) return res.status(500).json({ error: "Erreur lors de l'enregistrement de la famille." });

                            // 3. Création de la Personne
                            db.query('SELECT COALESCE(MAX(id_personne), 0) + 1 AS nextId FROM personne', (err5, rows3) => {
                                if (err5) return res.status(500).json({ error: "Erreur lors de la génération de l'ID personne." });
                                const nextPersonId = rows3[0].nextId;

                                db.query('CALL proc_gestion_personne(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                    ['INSERT', nextPersonId, nextFamId, nom, prenom, date_naissance, sexe, statut_familial, telephone, email], (err6) => {
                                        if (err6) return res.status(500).json({ error: "Erreur lors de l'enregistrement de la personne." });
                                        res.status(201).json({ success: "Compte créé avec succès !", id_personne: nextPersonId });
                                    });
                            });
                        });
                });
            });
    });
});

// Dashboard Dynamique (procédé stockée avec filtres famille/personne)
router.get('/dashboard/dynamic', (req, res) => {
    const { id_menage, id_famille, id_personne } = req.query;
    db.query('CALL proc_dashboard_dynamique(?, ?, ?)', [id_menage, id_famille || null, id_personne || null], (err, results) => {
        if (err) return res.status(500).json({ error: "Impossible de charger les statistiques." });
        res.json(results); // results[0] : résumé, results[1] : répartition dépenses
    });
});

// Membres filtrés (par ménage + famille optionnelle)
router.get('/members/filter', (req, res) => {
    const { id_menage, id_famille } = req.query;
    db.query('CALL proc_get_membres_filtre(?, ?)', [id_menage, id_famille || null], (err, results) => {
        if (err) return res.status(500).json({ error: "Impossible de charger les membres." });
        res.json(results); // results[0] tableau de membres
    });
});

// Dépenses détaillées (procédure stockée)
router.get('/depenses/detailed', (req, res) => {
    const { id_menage, id_famille, id_personne } = req.query;
    db.query('CALL proc_get_depenses_detaillees(?, ?, ?)', [id_menage, id_famille || null, id_personne || null], (err, results) => {
        if (err) return res.status(500).json({ error: "Impossible de charger les dépenses." });
        res.json(results); // results[0] tableau de dépenses détaillées
    });
});

// Revenus par ménage (reste inchangé)
router.get('/revenus/menage/:id', (req, res) => {
    db.query('CALL proc_get_revenus_by_menage_id(?)', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: "Impossible de charger les revenus." });
        res.json(results); // results[0] tableau des revenus
    });
});

// Avoirs par ménage (procédure existante)
router.get('/avoirs/menage/:id', (req, res) => {
    db.query('CALL proc_get_avoirs_by_menage_id(?)', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur lors du chargement des avoirs." });
        res.json(results);
    });
});

router.post('/avoirs', (req, res) => {
    const { id_menage, nom, type, description, valeur, date } = req.body;
    db.query('SELECT MAX(id_avoir) AS maxId FROM avoir', (err, rows) => {
        if (err) return res.status(500).json({ error: "Erreur technique ID." });
        const id = (rows[0]?.maxId || 0) + 1;
        db.query('CALL proc_gestion_avoir(?,?,?,?,?,?,?,?)', ['INSERT', id, id_menage, nom, type, description, valeur, date], (err2) => {
            if (err2) return res.status(500).json({ error: "Erreur lors de l'ajout." });
            res.json({ success: "Avoir ajouté !", id });
        });
    });
});

router.put('/avoirs/:id', (req, res) => {
    const id = Number(req.params.id);
    const { nom, type, description, valeur, date } = req.body;
    db.query('CALL proc_gestion_avoir(?,?,?,?,?,?,?,?)', ['UPDATE', id, null, nom, type, description, valeur, date], (err) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la modification." });
        res.json({ success: "Avoir mis à jour !" });
    });
});

router.delete('/avoirs/:id', (req, res) => {
    const id = Number(req.params.id);
    db.query('CALL proc_gestion_avoir(?,?,?,?,?,?,?,?)', ['DELETE', id, null, null, null, null, null, null], (err) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la suppression." });
        res.json({ success: "Avoir supprimé !" });
    });
});

// Besoins par ménage (procédure existante)
router.get('/besoins/menage/:id', (req, res) => {
    db.query('CALL proc_get_besoins_by_menage_id(?)', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur lors du chargement des besoins." });
        res.json(results);
    });
});

router.post('/besoins', (req, res) => {
    const { id_personne, nom, description, categorie, montant, date } = req.body;
    db.query('SELECT MAX(id_besoin) AS maxId FROM etat_besoin', (err, rows) => {
        if (err) return res.status(500).json({ error: "Erreur technique ID." });
        const id = (rows[0]?.maxId || 0) + 1;
        db.query('CALL proc_gestion_besoin(?,?,?,?,?,?,?,?)', ['INSERT', id, id_personne, nom, description, categorie, montant, date], (err2) => {
            if (err2) return res.status(500).json({ error: "Erreur lors de l'ajout." });
            res.json({ success: "Besoin enregistré !", id });
        });
    });
});

router.put('/besoins/:id', (req, res) => {
    const id = Number(req.params.id);
    const { nom, description, categorie, montant, date } = req.body;
    db.query('CALL proc_gestion_besoin(?,?,?,?,?,?,?,?)', ['UPDATE', id, null, nom, description, categorie, montant, date], (err) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la modification." });
        res.json({ success: "Besoin mis à jour !" });
    });
});

router.delete('/besoins/:id', (req, res) => {
    const id = Number(req.params.id);
    db.query('CALL proc_gestion_besoin(?,?,?,?,?,?,?,?)', ['DELETE', id, null, null, null, null, null, null], (err) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la suppression." });
        res.json({ success: "Besoin supprimé !" });
    });
});

module.exports = router;