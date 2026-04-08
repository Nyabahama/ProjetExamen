import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Members = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [form, setForm] = useState({ nom: '', prenom: '', date_naissance: '', sexe: 'M', statut_familial: 'CHEF_FAMILLE', telephone: '', email: '' });

    const fetchMembers = useCallback(async () => {
        try {
            if (!user) return;
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/members/filter`, {
                params: { id_menage: user.id_menage, id_famille: user.id_famille }
            });
            setMembers(res.data[0] || []);
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur de chargement");
        }
    }, [user]);

    useEffect(() => { fetchMembers(); }, [fetchMembers]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            if (selectedMember) {
                const res = await axios.put(`${apiUrl}/api/members/${selectedMember.id_personne}`, form);
                toast.success(res.data.success || "Membre mis à jour");
            } else {
                const res = await axios.post(`${apiUrl}/api/members`, { ...form, id_famille: user.id_famille });
                toast.success(res.data.success || "Membre ajouté");
            }
            setShowModal(false);
            setForm({ nom: '', prenom: '', date_naissance: '', sexe: 'M', statut_familial: 'CHEF_FAMILLE', telephone: '', email: '' });
            setSelectedMember(null);
            fetchMembers();
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur d'enregistrement");
        }
    };

    const handleEdit = (m) => {
        setSelectedMember(m);
        setForm({
            nom: m.nom,
            prenom: m.prenom,
            date_naissance: m.date_naissance ? m.date_naissance.slice(0, 10) : '',
            sexe: m.sexe,
            statut_familial: m.statut_familial,
            telephone: m.telephone || '',
            email: m.email || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer ce membre ?")) return;
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const res = await axios.delete(`${apiUrl}/api/members/${id}`);
            toast.success(res.data.success || "Supprimé");
            fetchMembers();
        } catch (err) {
            toast.error("Erreur de suppression");
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Membres de la famille {user?.nom_famille}</h2>
                <button onClick={() => { setSelectedMember(null); setForm({nom:'', prenom:'', date_naissance:'', sexe:'M', statut_familial:'CHEF_FAMILLE', telephone:'', email:''}); setShowModal(true); }} 
                        style={{ background: '#2c3e50', color: 'white', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                    + Ajouter un membre
                </button>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedMember ? "Modifier Membre" : "Nouveau Membre"}>
                    <form onSubmit={handleSave}>
                        <input style={inputStyle} placeholder="Nom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required />
                        <input style={inputStyle} placeholder="Prénom" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} required />
                        <label style={{fontSize:'0.8rem'}}>Date de naissance</label>
                        <input style={inputStyle} type="date" value={form.date_naissance} onChange={e => setForm({...form, date_naissance: e.target.value})} required />
                        <select style={inputStyle} value={form.sexe} onChange={e => setForm({...form, sexe: e.target.value})}>
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                        </select>
                        <select style={inputStyle} value={form.statut_familial} onChange={e => setForm({...form, statut_familial: e.target.value})} required>
                            <option value="CHEF_FAMILLE">Chef de Famille</option>
                            <option value="CONJOINT">Conjoint</option>
                            <option value="ENFANT">Enfant</option>
                            <option value="DEPENDANT">Dépendant</option>
                        </select>
                        <input style={inputStyle} placeholder="Téléphone" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} />
                        <input style={inputStyle} type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            <button type="submit" style={{ flex: 1, padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px' }}>
                                {selectedMember ? "Mettre à jour" : "Enregistrer"}
                            </button>
                            <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }}>Annuler</button>
                        </div>
                    </form>
            </Modal>

            <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', minWidth: '600px' }}>
                    <thead style={{ background: '#34495e', color: 'white' }}>
                        <tr>
                            <th style={{ padding: '10px' }}>Nom</th>
                            <th>Prénom</th>
                            <th>Sexe</th>
                            <th>Statut Familial</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.length > 0 ? members.map((m) => (
                            <tr key={m.id_personne} style={{ borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                                <td style={{ padding: '10px' }}>{m.nom.toUpperCase()}</td>
                                <td>{m.prenom}</td>
                                <td>{m.sexe}</td>
                                <td>{m.statut_familial}</td>
                                <td>
                                    <button onClick={() => handleEdit(m)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '5px', borderRadius: '3px', marginRight: '5px' }}>Éditer</button>
                                    <button onClick={() => handleDelete(m.id_personne)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px', borderRadius: '3px' }}>Suppr.</button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="4" style={{ padding: '20px' }}>Aucun membre trouvé.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={modalHeaderStyle}>
                    <h3 style={{ margin: 0, color: '#2c3e50' }}>{title}</h3>
                    <button onClick={onClose} style={closeButtonStyle}>&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const modalOverlayStyle = {
    position: 'fixed',
    top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.6)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000, padding: '15px'
};

const modalContentStyle = {
    background: 'white',
    padding: '25px',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
};

const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px'
};

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#666',
    lineHeight: '1'
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ddd'
};

export default Members;