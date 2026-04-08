const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// On utilise le pool exporté ou configuré avec promises
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
}).promise();

// Route de Login
router.post('/auth/login', async (req, res) => {
    const { nom, nomFamille } = req.body;
    try {
        const sql = `
            SELECT p.id_personne, p.nom, p.prenom, f.id_famille, f.nom_famille, f.id_menage 
            FROM personne p 
            JOIN famille f ON p.id_famille = f.id_famille 
            WHERE p.nom = ? AND f.nom_famille = ?
            LIMIT 1
        `;
        const [result] = await db.query(sql, [nom, nomFamille]);
        if (result.length > 0) {
            res.json({ user: result[0] });
        } else {
            res.status(401).json({ error: "Utilisateur non trouvé. Vérifiez vos identifiants." });
        }
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la connexion." });
    }
});

// Route d'inscription (création famille et personne si nécessaire)
router.post('/auth/register', async (req, res) => {
    const { pays, ville, commune, quartier, avenue, numero_avenue, nomFamille, nom, prenom, date_naissance, sexe, statut_familial, telephone, email } = req.body;

    if (!nom || !nomFamille) return res.status(400).json({ error: 'Nom et nom de famille requis' });

    try {
        // Utilisation d'async/await pour un code propre et robuste
        const [mRows] = await db.query('SELECT COALESCE(MAX(id_menage), 0) + 1 AS nextId FROM menage');
        const nextMenageId = mRows[0].nextId;
        await db.query('CALL proc_gestion_menage(?, ?, ?, ?, ?, ?, ?, ?)', ['INSERT', nextMenageId, pays, ville, commune, quartier, avenue, numero_avenue]);

        const [fRows] = await db.query('SELECT COALESCE(MAX(id_famille), 0) + 1 AS nextId FROM famille');
        const nextFamId = fRows[0].nextId;
        await db.query('CALL proc_gestion_famille(?, ?, ?, ?)', ['INSERT', nextFamId, nextMenageId, nomFamille]);

        const [pRows] = await db.query('SELECT COALESCE(MAX(id_personne), 0) + 1 AS nextId FROM personne');
        const nextPersonId = pRows[0].nextId;
        await db.query('CALL proc_gestion_personne(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', ['INSERT', nextPersonId, nextFamId, nom, prenom, date_naissance, sexe, statut_familial, telephone, email]);

        res.status(201).json({ success: "Compte créé avec succès !", id_personne: nextPersonId });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de l'inscription. Détails: " + err.message });
    }
});

// Dashboard Dynamique (procédé stockée avec filtres famille/personne)
router.get('/dashboard/dynamic', async (req, res) => {
    const { id_menage, id_famille, id_personne } = req.query;
    try {
        const [results] = await db.query('CALL proc_dashboard_dynamique(?, ?, ?)', [id_menage, id_famille || null, id_personne || null]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Impossible de charger les statistiques." });
    }
});

// Membres filtrés (par ménage + famille optionnelle)
router.get('/members/filter', async (req, res) => {
    const { id_menage, id_famille } = req.query;
    try {
        const [results] = await db.query('CALL proc_get_membres_filtre(?, ?)', [id_menage, id_famille || null]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Impossible de charger les membres." });
    }
});

// Dépenses détaillées (procédure stockée)
router.get('/depenses/detailed', async (req, res) => {
    const { id_menage, id_famille, id_personne } = req.query;
    try {
        const [results] = await db.query('CALL proc_get_depenses_detaillees(?, ?, ?)', [id_menage, id_famille || null, id_personne || null]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Impossible de charger les dépenses." });
    }
});

// Revenus par ménage (reste inchangé)
router.get('/revenus/menage/:id', async (req, res) => {
    try {
        const [results] = await db.query('CALL proc_get_revenus_by_menage_id(?)', [req.params.id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Impossible de charger les revenus." });
    }
});

// Avoirs par ménage (procédure existante)
router.get('/avoirs/menage/:id', async (req, res) => {
    try {
        const [results] = await db.query('CALL proc_get_avoirs_by_menage_id(?)', [req.params.id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors du chargement des avoirs." });
    }
});

router.post('/avoirs', async (req, res) => {
    const { id_menage, nom, type, description, valeur, date } = req.body;
    try {
        const [rows] = await db.query('SELECT MAX(id_avoir) AS maxId FROM avoir');
        const id = (rows[0]?.maxId || 0) + 1;
        await db.query('CALL proc_gestion_avoir(?,?,?,?,?,?,?,?)', ['INSERT', id, id_menage, nom, type, description, valeur, date]);
        res.json({ success: "Avoir ajouté !", id });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de l'ajout de l'avoir." });
    }
});

router.put('/avoirs/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { nom, type, description, valeur, date } = req.body;
    try {
        await db.query('CALL proc_gestion_avoir(?,?,?,?,?,?,?,?)', ['UPDATE', id, null, nom, type, description, valeur, date]);
        res.json({ success: "Avoir mis à jour !" });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la modification." });
    }
});

router.delete('/avoirs/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        await db.query('CALL proc_gestion_avoir(?,?,?,?,?,?,?,?)', ['DELETE', id, null, null, null, null, null, null]);
        res.json({ success: "Avoir supprimé !" });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la suppression." });
    }
});

// Besoins par ménage (procédure existante)
router.get('/besoins/menage/:id', async (req, res) => {
    try {
        const [results] = await db.query('CALL proc_get_besoins_by_menage_id(?)', [req.params.id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors du chargement des besoins." });
    }
});

router.post('/besoins', async (req, res) => {
    const { id_personne, nom, description, categorie, montant, date } = req.body;
    try {
        const [rows] = await db.query('SELECT MAX(id_besoin) AS maxId FROM etat_besoin');
        const id = (rows[0]?.maxId || 0) + 1;
        await db.query('CALL proc_gestion_besoin(?,?,?,?,?,?,?,?)', ['INSERT', id, id_personne, nom, description, categorie, montant, date]);
        res.json({ success: "Besoin enregistré !", id });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de l'ajout du besoin." });
    }
});

router.put('/besoins/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { nom, description, categorie, montant, date } = req.body;
    try {
        await db.query('CALL proc_gestion_besoin(?,?,?,?,?,?,?,?)', ['UPDATE', id, null, nom, description, categorie, montant, date]);
        res.json({ success: "Besoin mis à jour !" });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la modification." });
    }
});

router.delete('/besoins/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        await db.query('CALL proc_gestion_besoin(?,?,?,?,?,?,?,?)', ['DELETE', id, null, null, null, null, null, null]);
        res.json({ success: "Besoin supprimé !" });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la suppression." });
    }
});

// --- NOUVELLES ROUTES DE GESTION ---

// Ajouter un membre (Personne)
router.post('/members', async (req, res) => {
    const { id_famille, nom, prenom, date_naissance, sexe, statut_familial, telephone, email } = req.body;
    try {
        const [rows] = await db.query('SELECT COALESCE(MAX(id_personne), 0) + 1 AS nextId FROM personne');
        const id = rows[0].nextId;
        await db.query('CALL proc_gestion_personne(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            ['INSERT', id, id_famille, nom, prenom, date_naissance, sexe, statut_familial, telephone, email]);
        res.json({ success: "Membre ajouté avec succès !", id });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de l'ajout du membre." });
    }
});

// Ajouter une dépense
router.post('/expenses', async (req, res) => {
    const { id_personne, categorie, montant, date, mode, description } = req.body;
    try {
        const [rows] = await db.query('SELECT COALESCE(MAX(id_depense), 0) + 1 AS nextId FROM depense');
        const id = rows[0].nextId;
        await db.query('INSERT INTO depense (id_depense, id_personne, categorie_depense, montant, date_depense, mode_paiement, description) VALUES (?,?,?,?,?,?,?)', 
            [id, id_personne, categorie, montant, date, mode, description]);
        res.json({ success: "Dépense enregistrée !" });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de l'enregistrement de la dépense." });
    }
});

// Ajouter un revenu
router.post('/revenus', async (req, res) => {
    const { id_menage, profession, montant, frequence, date } = req.body;
    try {
        await db.query('INSERT INTO revenus (id_menage, profession, montant_revenu, frequence, date_reception) VALUES (?,?,?,?,?)', 
            [id_menage, profession, montant, frequence, date]);
        res.json({ success: "Revenu ajouté !" });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de l'ajout du revenu." });
    }
});

module.exports = router;