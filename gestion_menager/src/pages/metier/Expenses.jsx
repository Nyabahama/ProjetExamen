import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Expenses = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/depenses/detailed`, {
                    params: { id_menage: user.id_menage, id_famille: user.id_famille, id_personne: user.id_personne }
                });
                setExpenses(res.data[0]); // résultat proc call : results[0] tableau de dépenses
            } catch (err) {
                console.error("Erreur lors de la récupération des dépenses", err);
            }
        };
        if (user) fetchExpenses();
    }, [user]);

    return (
        <div>
            <h2>Dépenses du ménage</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead style={{ background: '#34495e', color: 'white' }}>
                    <tr>
                        <th style={{ padding: '10px' }}>Date</th>
                        <th>Catégorie</th>
                        <th>Montant</th>
                        <th>Mode</th>
                        <th>Description</th>
                        <th>Personne</th>
                        <th>Famille</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((exp) => (
                        <tr key={exp.id_depense} style={{ borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                            <td style={{ padding: '10px' }}>{new Date(exp.date_depense).toLocaleDateString()}</td>
                            <td>{exp.categorie_depense}</td>
                            <td>{exp.montant} $</td>
                            <td>{exp.mode_paiement}</td>
                            <td>{exp.description}</td>
                            <td>{exp.prenom} {exp.nom}</td>
                            <td>{exp.nom_famille}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Expenses;