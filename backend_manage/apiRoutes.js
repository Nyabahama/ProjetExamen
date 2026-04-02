const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Configuration de la base de données
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'groupe3_gestion_menage_db'
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
        if (err) return res.status(500).send(err);
        if (result.length > 0) {
            res.json({ user: result[0] });
        } else {
            res.json({ user: null });
        }
    });
});

// Route d'inscription (création famille et personne si nécessaire)
router.post('/auth/register', async (req, res) => {
    const { nom, nomFamille, prenom } = req.body;
    if (!nom || !nomFamille) return res.status(400).json({ error: 'Nom et nom de famille requis' });

    db.query('SELECT * FROM famille WHERE nom_famille = ?', [nomFamille], (err, familles) => {
        if (err) return res.status(500).send(err);
        const createPerson = (id_famille, id_menage) => {
            db.query('SELECT MAX(id_personne) AS maxId FROM personne', (err2, maxRes) => {
                if (err2) return res.status(500).send(err2);
                const nextPersonId = (maxRes[0]?.maxId || 0) + 1;
                db.query('INSERT INTO personne (id_personne, id_famille, nom, prenom) VALUES (?, ?, ?, ?)',
                    [nextPersonId, id_famille, nom, prenom || nom], (err3) => {
                        if (err3) return res.status(500).send(err3);
                        res.json({ success: true, id_personne: nextPersonId, id_famille, id_menage });
                    });
            });
        };

        if (familles.length > 0) {
            const fam = familles[0];
            createPerson(fam.id_famille, fam.id_menage);
        } else {
            db.query('SELECT MAX(id_famille) AS maxId FROM famille', (err4, maxFam) => {
                if (err4) return res.status(500).send(err4);
                const nextFamId = (maxFam[0]?.maxId || 0) + 1;
                db.query('SELECT MAX(id_menage) AS maxMenage FROM menage', (err5, maxMenageRes) => {
                    if (err5) return res.status(500).send(err5);
                    const nextMenage = (maxMenageRes[0]?.maxMenage || 0) + 1;
                    db.query('INSERT INTO menage (id_menage) VALUES (?)', [nextMenage], (err6) => {
                        if (err6) return res.status(500).send(err6);
                        db.query('INSERT INTO famille (id_famille, id_menage, nom_famille) VALUES (?, ?, ?)',
                            [nextFamId, nextMenage, nomFamille], (err7) => {
                                if (err7) return res.status(500).send(err7);
                                createPerson(nextFamId, nextMenage);
                            });
                    });
                });
            });
        }
    });
});

// Dashboard Dynamique (procédé stockée avec filtres famille/personne)
router.get('/dashboard/dynamic', (req, res) => {
    const { id_menage, id_famille, id_personne } = req.query;
    db.query('CALL proc_dashboard_dynamique(?, ?, ?)', [id_menage, id_famille || null, id_personne || null], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results); // results[0] : résumé, results[1] : répartition dépenses
    });
});

// Membres filtrés (par ménage + famille optionnelle)
router.get('/members/filter', (req, res) => {
    const { id_menage, id_famille } = req.query;
    db.query('CALL proc_get_membres_filtre(?, ?)', [id_menage, id_famille || null], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results); // results[0] tableau de membres
    });
});

// Dépenses détaillées (procédure stockée)
router.get('/depenses/detailed', (req, res) => {
    const { id_menage, id_famille, id_personne } = req.query;
    db.query('CALL proc_get_depenses_detaillees(?, ?, ?)', [id_menage, id_famille || null, id_personne || null], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results); // results[0] tableau de dépenses détaillées
    });
});

// Revenus par ménage (reste inchangé)
router.get('/revenus/menage/:id', (req, res) => {
    db.query('CALL proc_get_revenus_by_menage_id(?)', [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results); // results[0] tableau des revenus
    });
});

// Avoirs par ménage (procédure existante)
router.get('/avoirs/menage/:id', (req, res) => {
    db.query('CALL proc_get_avoirs_by_menage_id(?)', [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

router.post('/avoirs', (req, res) => {
    const { id_menage, nom, type, description, valeur, date } = req.body;
    db.query('SELECT MAX(id_avoir) AS maxId FROM avoir', (err, rows) => {
        if (err) return res.status(500).send(err);
        const id = (rows[0]?.maxId || 0) + 1;
        db.query('CALL proc_gestion_avoir(?,?,?,?,?,?,?,?)', ['INSERT', id, id_menage, nom, type, description, valeur, date], (err2) => {
            if (err2) return res.status(500).send(err2);
            res.json({ success: true, id });
        });
    });
});

router.put('/avoirs/:id', (req, res) => {
    const id = Number(req.params.id);
    const { nom, type, description, valeur, date } = req.body;
    db.query('CALL proc_gestion_avoir(?,?,?,?,?,?,?,?)', ['UPDATE', id, null, nom, type, description, valeur, date], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true });
    });
});

router.delete('/avoirs/:id', (req, res) => {
    const id = Number(req.params.id);
    db.query('CALL proc_gestion_avoir(?,?,?,?,?,?,?,?)', ['DELETE', id, null, null, null, null, null, null], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true });
    });
});

// Besoins par ménage (procédure existante)
router.get('/besoins/menage/:id', (req, res) => {
    db.query('CALL proc_get_besoins_by_menage_id(?)', [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

router.post('/besoins', (req, res) => {
    const { id_personne, nom, description, categorie, montant, date } = req.body;
    db.query('SELECT MAX(id_besoin) AS maxId FROM etat_besoin', (err, rows) => {
        if (err) return res.status(500).send(err);
        const id = (rows[0]?.maxId || 0) + 1;
        db.query('CALL proc_gestion_besoin(?,?,?,?,?,?,?,?)', ['INSERT', id, id_personne, nom, description, categorie, montant, date], (err2) => {
            if (err2) return res.status(500).send(err2);
            res.json({ success: true, id });
        });
    });
});

router.put('/besoins/:id', (req, res) => {
    const id = Number(req.params.id);
    const { nom, description, categorie, montant, date } = req.body;
    db.query('CALL proc_gestion_besoin(?,?,?,?,?,?,?,?)', ['UPDATE', id, null, nom, description, categorie, montant, date], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true });
    });
});

router.delete('/besoins/:id', (req, res) => {
    const id = Number(req.params.id);
    db.query('CALL proc_gestion_besoin(?,?,?,?,?,?,?,?)', ['DELETE', id, null, null, null, null, null, null], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true });
    });
});

// Revenus par ménage
router.get('/revenus/menage/:id', (req, res) => {
    db.query('CALL proc_get_revenus_by_menage_id(?)', [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

module.exports = router;