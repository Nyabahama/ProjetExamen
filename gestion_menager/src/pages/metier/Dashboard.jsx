import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/dashboard/dynamic`, {
                    params: { id_menage: user.id_menage, id_famille: user.id_famille, id_personne: user.id_personne }
                });
                setStats(res.data[0][0]);
            } catch (err) { console.error(err); }
        };
        if (user) fetchStats();
    }, [user]);

    if (!stats) return <div>Chargement des données de la famille {user?.nom_famille}...</div>;

    return (
        <div>
            <h2>Statistiques du Ménage</h2>
            <div className="stats-grid">
                <div className="card"><h4>Total Revenus</h4><p>{stats.total_revenus} $</p></div>
                <div className="card"><h4>Total Dépenses</h4><p>{stats.total_depenses} $</p></div>
                <div className="card"><h4>Total Avoirs</h4><p>{stats.total_avoirs} $</p></div>
                <div className="card"><h4>Membres</h4><p>{stats.nombre_membres}</p></div>
            </div>
        </div>
    );
};

export default Dashboard;