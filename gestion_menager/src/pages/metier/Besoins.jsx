import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Besoins = () => {
    const { user } = useAuth();
    const [besoins, setBesoins] = useState([]);
    const [selectedBesoin, setSelectedBesoin] = useState(null);
    const [form, setForm] = useState({ nom: '', description: '', categorie: '', montant: 0, date: '' });

    const fetchBesoins = useCallback(async () => {
        try {
            if (!user) return;
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/besoins/menage/${user.id_menage}`);
            setBesoins(res.data[0] || []);
        } catch (err) {
            toast.error("Erreur de chargement des besoins");
        }
    }, [user]);

    useEffect(() => { fetchBesoins(); }, [fetchBesoins]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        if (selectedBesoin) {
            const res = await axios.put(`${apiUrl}/api/besoins/${selectedBesoin.id_besoin}`, {
                nom: form.nom,
                description: form.description,
                categorie: form.categorie,
                montant: form.montant,
                date: form.date
            });
            toast.success(res.data.success);
        } else {
            const res = await axios.post(`${apiUrl}/api/besoins`, {
                id_personne: user.id_personne,
                nom: form.nom,
                description: form.description,
                categorie: form.categorie,
                montant: form.montant,
                date: form.date
            });
            toast.success(res.data.success);
        }
        setSelectedBesoin(null);
        setForm({ nom: '', description: '', categorie: '', montant: 0, date: '' });
        fetchBesoins();
        } catch (err) {
            toast.error("Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (id) => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const res = await axios.delete(`${apiUrl}/api/besoins/${id}`);
            toast.success(res.data.success);
            if (selectedBesoin?.id_besoin === id) {
                setSelectedBesoin(null);
                setForm({ nom: '', description: '', categorie: '', montant: 0, date: '' });
            }
            fetchBesoins();
        } catch (err) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleEdit = (item) => {
        setSelectedBesoin(item);
        setForm({
            nom: item.nom_besoin,
            description: item.description_besoin || '',
            categorie: item.categorie_besoin || '',
            montant: item.montant_estime || 0,
            date: item.date_demande ? item.date_demande.toString().slice(0, 10) : ''
        });
    };

    return (
        <div>
            <h2>Besoins du ménage</h2>
            <form onSubmit={handleSave} style={{ marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <input required placeholder="Nom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
                    <input required placeholder="Catégorie" value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value})} />
                    <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    <input type="number" required placeholder="Montant" value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} />
                    <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <button type="submit" style={{ marginTop: '10px' }}>Ajouter / Mettre à jour</button>
            </form>

            <table>
                <thead><tr><th>Nom</th><th>Catégorie</th><th>Description</th><th>Montant</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                    {besoins.map(b => (
                        <tr key={b.id_besoin}>
                            <td>{b.nom_besoin}</td>
                            <td>{b.categorie_besoin}</td>
                            <td>{b.description_besoin}</td>
                            <td>{b.montant_estime}</td>
                            <td>{b.date_demande}</td>
                            <td>
                                <button onClick={() => handleEdit(b)}>Éditer</button>
                                <button onClick={() => handleDelete(b.id_besoin)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Besoins;
