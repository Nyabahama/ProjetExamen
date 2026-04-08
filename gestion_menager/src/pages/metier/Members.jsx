import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Members = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ nom: '', prenom: '', date_naissance: '', sexe: 'M', statut_familial: '', telephone: '', email: '' });

    const fetchMembers = useCallback(async () => {
        try {
            if (!user) return;
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/members/filter`, {
                params: { id_menage: user.id_menage, id_famille: user.id_famille }
            });
            setMembers(res.data[0]);
        } catch (err) {
            toast.error("Erreur lors de la récupération des membres");
        }
    }, [user]);

    useEffect(() => { fetchMembers(); }, [fetchMembers]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${apiUrl}/api/members`, { ...form, id_famille: user.id_famille });
            toast.success(res.data.success);
            setShowModal(false);
            setForm({ nom: '', prenom: '', date_naissance: '', sexe: 'M', statut_familial: '', telephone: '', email: '' });
            fetchMembers();
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur lors de l'ajout");
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Membres de la famille {user?.nom_famille}</h2>
                <button onClick={() => setShowModal(true)} style={{ background: '#2c3e50', color: 'white', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                    + Ajouter un membre
                </button>
            </div>

            {showModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <form onSubmit={handleAdd} className="modal-content" style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '400px' }}>
                        <h3>Nouveau Membre</h3>
                        <input style={inputStyle} placeholder="Nom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required />
                        <input style={inputStyle} placeholder="Prénom" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} required />
                        <input style={inputStyle} type="date" value={form.date_naissance} onChange={e => setForm({...form, date_naissance: e.target.value})} required />
                        <select style={inputStyle} value={form.sexe} onChange={e => setForm({...form, sexe: e.target.value})}>
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                        </select>
                        <input style={inputStyle} placeholder="Statut (ex: Enfant)" value={form.statut_familial} onChange={e => setForm({...form, statut_familial: e.target.value})} required />
                        <input style={inputStyle} placeholder="Téléphone" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} />
                        <input style={inputStyle} type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            <button type="submit" style={{ flex: 1, padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px' }}>Enregistrer</button>
                            <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }}>Annuler</button>
                        </div>
                    </form>
                </div>
            )}

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

const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ddd'
};

export default Members;