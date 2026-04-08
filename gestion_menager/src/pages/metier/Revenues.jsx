import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Revenues = () => {
    const { user } = useAuth();
    const [revenus, setRevenues] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ profession: '', montant: '', frequence: 'Mensuel', date: '' });

    const fetchRevenues = useCallback(async () => {
        try {
            if (!user) return;
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/revenus/menage/${user.id_menage}`);
            setRevenues(res.data[0]);
        } catch (err) {
            toast.error("Erreur de chargement des revenus");
        }
    }, [user]);

    useEffect(() => { fetchRevenues(); }, [fetchRevenues]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${apiUrl}/api/revenus`, { ...form, id_menage: user.id_menage });
            toast.success(res.data.success);
            setShowModal(false);
            setForm({ profession: '', montant: '', frequence: 'Mensuel', date: '' });
            fetchRevenues();
        } catch (err) {
            toast.error("Erreur lors de l'ajout du revenu");
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Revenus du ménage</h2>
                <button onClick={() => setShowModal(true)} style={{ background: '#27ae60', color: 'white', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', border: 'none' }}>
                    + Ajouter un revenu
                </button>
            </div>

            {showModal && (
                <div style={modalOverlayStyle}>
                    <form onSubmit={handleAdd} style={modalContentStyle}>
                        <h3>Nouveau Revenu</h3>
                        <input style={inputStyle} placeholder="Profession / Source" value={form.profession} onChange={e => setForm({...form, profession: e.target.value})} required />
                        <input style={inputStyle} type="number" placeholder="Montant ($)" value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} required />
                        <select style={inputStyle} value={form.frequence} onChange={e => setForm({...form, frequence: e.target.value})}>
                            <option value="Mensuel">Mensuel</option>
                            <option value="Hebdomadaire">Hebdomadaire</option>
                            <option value="Ponctuel">Ponctuel</option>
                        </select>
                        <input style={inputStyle} type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="submit" style={{ flex: 1, padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px' }}>Enregistrer</button>
                            <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }}>Annuler</button>
                        </div>
                    </form>
                </div>
            )}

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

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalContentStyle = {
    background: 'white',
    padding: '25px',
    borderRadius: '8px',
    width: '400px'
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ddd'
};

export default Revenues;