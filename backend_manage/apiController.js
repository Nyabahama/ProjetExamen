const db = require('./db'); // Utilise le pool existant de db.js

const executeQuery = async (query, params) => {
    const [rows] = await db.execute(query, params);
    return rows;
};

// --- LOGIN HANDLER ---
exports.login = async (req, res) => {
    const { nom, nom_famille } = req.body;
    try {
        // On cherche la personne qui correspond au nom ET au nom de sa famille
        const query = `
            SELECT p.*, f.nom_famille, f.id_menage 
            FROM personne p 
            JOIN famille f ON p.id_famille = f.id_famille 
            WHERE p.nom = ? AND f.nom_famille = ?`;
        
        const rows = await executeQuery(query, [nom, nom_famille]);

        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ success: false, message: "Utilisateur ou famille introuvable." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- GENERIC CRUD HANDLER ---
exports.manageEntity = async (req, res) => {
    const { entity } = req.params; // ex: personnes, familles, depenses
    const { action, id, data, id_menage } = req.body;

    let procedure = "";
    let params = [];

    try {
        switch (entity) {
            case 'personnes':
                procedure = 'CALL proc_gestion_personne(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                params = [action, id, data.id_famille, data.nom, data.prenom, data.date_naissance, data.sexe, data.statut_familial, data.telephone, data.email];
                break;
            case 'familles':
                procedure = 'CALL proc_gestion_famille(?, ?, ?, ?)';
                params = [action, id, id_menage, data.nom_famille];
                break;
            case 'depenses':
                procedure = 'CALL proc_gestion_depense(?, ?, ?, ?, ?, ?, ?, ?, ?)';
                params = [action, id, data.id_personne, data.type_depense, data.categorie_depense, data.montant, data.mode_paiement, data.description, data.date_depense];
                break;
            // Ajouter les autres cas (revenus, avoirs...) sur le même modèle
        }

        await executeQuery(procedure, params);
        res.json({ success: true, message: `${entity} mis à jour avec succès` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- FETCH HANDLERS ---
exports.getDashboard = async (req, res) => {
    try {
        const { id_menage } = req.params;
        const results = await executeQuery('CALL proc_dashboard_global(?)', [id_menage]);
        res.json({
            stats: results[0][0],
            categories: results[1]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEntities = async (req, res) => {
    const { entity, id_menage } = req.params;
    let procedure = "";
    
    if (entity === 'personnes') procedure = 'proc_get_personnes_by_menage_id';
    else if (entity === 'familles') procedure = 'proc_get_familles_by_menage_id';
    else if (entity === 'depenses') procedure = 'proc_get_depenses_by_menage_id';
    else if (entity === 'revenus') procedure = 'proc_get_revenus_by_menage_id';
    else if (entity === 'avoirs') procedure = 'proc_get_avoirs_by_menage_id';
    else if (entity === 'besoins') procedure = 'proc_get_besoins_by_menage_id';
    else if (entity === 'menages') procedure = 'proc_get_menage_by_id'; 

    try {
        const rows = await executeQuery(`CALL ${procedure}(?)`, [id_menage]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};