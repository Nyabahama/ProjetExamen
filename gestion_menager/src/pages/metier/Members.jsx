import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Members = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${apiUrl}/api/members/filter`, {
                    params: { id_menage: user.id_menage, id_famille: user.id_famille }
                });
                setMembers(res.data[0]); // résultat proc call : results[0] tableau de membres
            } catch (err) {
                console.error("Erreur lors de la récupération des membres", err);
            }
        };
        if (user) fetchMembers();
    }, [user]);

    return (
        <div>
            <h2>Membres de la famille {user?.nom_famille}</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead style={{ background: '#34495e', color: 'white' }}>
                    <tr>
                        <th style={{ padding: '10px' }}>Nom</th>
                        <th>Prénom</th>
                        <th>Sexe</th>
                        <th>Statut Familial</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((m) => (
                        <tr key={m.id_personne} style={{ borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                            <td style={{ padding: '10px' }}>{m.nom}</td>
                            <td>{m.prenom}</td>
                            <td>{m.sexe}</td>
                            <td>{m.statut_familial}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Members;