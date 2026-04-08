import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Avoir = () => {
    const { user } = useAuth();
    const [avoirs, setAvoirs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedAvoir, setSelectedAvoir] = useState(null);
    const [form, setForm] = useState({ nom: '', type: '', description: '', valeur: 0, date: '' });

    const fetchAvoirs = useCallback(async () => {
        try {
            if (!user) return;
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/avoirs/menage/${user.id_menage}`);
            setAvoirs(res.data[0] || []);
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur de chargement");
        }
    }, [user]);

    useEffect(() => { fetchAvoirs(); }, [fetchAvoirs]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        if (selectedAvoir) {
            const res = await axios.put(`${apiUrl}/api/avoirs/${selectedAvoir.id_avoir}`, {
                nom: form.nom,
                type: form.type,
                description: form.description,
                valeur: form.valeur,
                date: form.date
            });
            toast.success(res.data.success);
        } else {
            const res = await axios.post(`${apiUrl}/api/avoirs`, {
                id_menage: user.id_menage,
                nom: form.nom,
                type: form.type,
                description: form.description,
                valeur: form.valeur,
                date: form.date
            });
            toast.success(res.data.success || "Enregistré");
        }

        setSelectedAvoir(null);
        setShowModal(false);
        setForm({ nom: '', type: '', description: '', valeur: 0, date: '' });
        fetchAvoirs();
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur d'enregistrement");
        }
    };

    const handleDelete = async (id) => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const res = await axios.delete(`${apiUrl}/api/avoirs/${id}`);
            toast.success(res.data.success || "Supprimé");
            if (selectedAvoir?.id_avoir === id) {
                setSelectedAvoir(null);
                setForm({ nom: '', type: '', description: '', valeur: 0, date: '' });
            }
            fetchAvoirs();
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur de suppression");
        }
    };

    const handleEdit = (item) => {
        setSelectedAvoir(item);
        setShowModal(true);
        setForm({
            nom: item.nom_avoir,
            type: item.type_avoir,
            description: item.description_avoir || '',
            valeur: item.valeur_estimee || 0,
            date: item.date_acquisition ? item.date_acquisition.toString().slice(0, 10) : ''
        });
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Avoirs du ménage</h2>
                <button onClick={() => { setSelectedAvoir(null); setForm({nom:'', type:'', description:'', valeur:0, date:''}); setShowModal(true); }} 
                        style={{ background: '#2c3e50', color: 'white', padding: '10px 15px', borderRadius: '5px' }}>
                    + Nouvel Avoir
                </button>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedAvoir ? "Modifier" : "Ajouter"}>
                <form onSubmit={handleSave}>
                    <input style={inputStyle} required placeholder="Nom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
                    <input style={inputStyle} required placeholder="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
                    <textarea style={inputStyle} placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    <input style={inputStyle} type="number" required placeholder="Valeur" value={form.valeur} onChange={e => setForm({...form, valeur: e.target.value})} />
                    <input style={inputStyle} type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                    <button type="submit" style={{ width: '100%', padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', marginTop: '10px' }}>Enregistrer</button>
                </form>
            </Modal>

            <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', minWidth: '600px' }}>
                    <thead style={{ background: '#34495e', color: 'white' }}>
                        <tr><th>Nom</th><th>Type</th><th>Description</th><th>Valeur</th><th>Date</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {avoirs.map(a => (
                            <tr key={a.id_avoir} style={{ borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                                <td style={{ padding: '10px' }}>{a.nom_avoir}</td>
                                <td>{a.type_avoir}</td>
                                <td>{a.description_avoir}</td>
                                <td>{a.valeur_estimee} $</td>
                                <td>{a.date_acquisition ? new Date(a.date_acquisition).toLocaleDateString() : '-'}</td>
                                <td>
                                    <button onClick={() => handleEdit(a)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', marginRight: '5px' }}>Éditer</button>
                                    <button onClick={() => handleDelete(a.id_avoir)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px' }}>Suppr.</button>
                                </td>
                            </tr>
                        ))}
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

const inputStyle = { width: '100%', padding: '10px', margin: '8px 0', borderRadius: '4px', border: '1px solid #ddd' };

export default Avoir;
