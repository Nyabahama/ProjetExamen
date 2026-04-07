import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Avoir = () => {
    const { user } = useAuth();
    const [avoirs, setAvoirs] = useState([]);
    const [selectedAvoir, setSelectedAvoir] = useState(null);
    const [form, setForm] = useState({ nom: '', type: '', description: '', valeur: 0, date: '' });

    const fetchAvoirs = useCallback(async () => {
        if (!user) return;
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${apiUrl}/api/avoirs/menage/${user.id_menage}`);
        setAvoirs(res.data[0] || []);
    }, [user]);

    useEffect(() => { fetchAvoirs(); }, [fetchAvoirs]);

    const handleSave = async (e) => {
        e.preventDefault();
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        if (selectedAvoir) {
            await axios.put(`${apiUrl}/api/avoirs/${selectedAvoir.id_avoir}`, {
                nom: form.nom,
                type: form.type,
                description: form.description,
                valeur: form.valeur,
                date: form.date
            });
        } else {
            await axios.post(`${apiUrl}/api/avoirs`, {
                id_menage: user.id_menage,
                nom: form.nom,
                type: form.type,
                description: form.description,
                valeur: form.valeur,
                date: form.date
            });
        }

        setSelectedAvoir(null);
        setForm({ nom: '', type: '', description: '', valeur: 0, date: '' });
        fetchAvoirs();
    };

    const handleDelete = async (id) => {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        await axios.delete(`${apiUrl}/api/avoirs/${id}`);
        if (selectedAvoir?.id_avoir === id) {
            setSelectedAvoir(null);
            setForm({ nom: '', type: '', description: '', valeur: 0, date: '' });
        }
        fetchAvoirs();
    };

    const handleEdit = (item) => {
        setSelectedAvoir(item);
        setForm({
            nom: item.nom_avoir,
            type: item.type_avoir,
            description: item.description_avoir || '',
            valeur: item.valeur_estimee || 0,
            date: item.date_acquisition ? item.date_acquisition.toString().slice(0, 10) : ''
        });
    };

    return (
        <div>
            <h2>Avoirs du ménage</h2>
            <form onSubmit={handleSave} style={{ marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <input required placeholder="Nom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
                    <input required placeholder="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
                    <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    <input type="number" required placeholder="Valeur" value={form.valeur} onChange={e => setForm({...form, valeur: e.target.value})} />
                    <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <button type="submit" style={{ marginTop: '10px' }}>Ajouter / Mettre à jour</button>
            </form>

            <table>
                <thead><tr><th>Nom</th><th>Type</th><th>Description</th><th>Valeur</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                    {avoirs.map(a => (
                        <tr key={a.id_avoir}>
                            <td>{a.nom_avoir}</td>
                            <td>{a.type_avoir}</td>
                            <td>{a.description_avoir}</td>
                            <td>{a.valeur_estimee}</td>
                            <td>{a.date_acquisition}</td>
                            <td>
                                <button onClick={() => handleEdit(a)}>Éditer</button>
                                <button onClick={() => handleDelete(a.id_avoir)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Avoir;
