import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Revenues = () => {
    const { user } = useAuth();
    const [revenus, setRevenues] = useState([]);

    useEffect(() => {
        const fetchRevenues = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${apiUrl}/api/revenus/menage/${user.id_menage}`);
                setRevenues(res.data[0]); 
            } catch (err) {
                console.error("Erreur lors de la récupération des revenus", err);
            }
        };
        if (user) fetchRevenues();
    }, [user]);

    return (
        <div>
            <h2>Revenus du ménage</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead style={{ background: '#27ae60', color: 'white' }}>
                    <tr>
                        <th style={{ padding: '10px' }}>Profession</th>
                        <th>Montant</th>
                        <th>Fréquence</th>
                        <th>Date Réception</th>
                    </tr>
                </thead>
                <tbody>
                    {revenus.map((r) => (
                        <tr key={r.id_revenu} style={{ borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                            <td style={{ padding: '10px' }}>{r.profession}</td>
                            <td>{r.montant_revenu} $</td>
                            <td>{r.frequence}</td>
                            <td>{new Date(r.date_reception).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Revenues;