import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Expenses = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [members, setMembers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ id_personne: '', type_depense: 'COURANTE', categorie_depense: 'ALIMENTATION', montant: '', date: '', mode_paiement: 'CASH', description: '' });

    const fetchData = useCallback(async () => {
        try {
            if (!user) return;
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const [resExp, resMem] = await Promise.all([
                axios.get(`${apiUrl}/api/depenses/detailed`, { params: { id_menage: user.id_menage, id_famille: user.id_famille } }),
                axios.get(`${apiUrl}/api/members/filter`, { params: { id_menage: user.id_menage, id_famille: user.id_famille } })
            ]);
            setExpenses(resExp.data[0] || []);
            setMembers(resMem.data[0] || []);
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur de chargement");
        }
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${apiUrl}/api/expenses`, form);
            toast.success(res.data.success || "Dépense ajoutée");
            setShowModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur lors de l'ajout");
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>Dépenses du ménage</h2>
                <button onClick={() => setShowModal(true)} style={{ background: '#c0392b', color: 'white', padding: '10px 15px', borderRadius: '5px' }}>
                    + Enregistrer une dépense
                </button>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Enregistrer une Dépense">
                    <form onSubmit={handleAdd}>
                        <select style={inputStyle} value={form.id_personne} onChange={e => setForm({...form, id_personne: e.target.value})} required>
                            <option value="">Sélectionner le membre</option>
                            {members.map(m => <option key={m.id_personne} value={m.id_personne}>{m.prenom} {m.nom}</option>)}
                        </select>
                        <select style={inputStyle} value={form.type_depense} onChange={e => setForm({...form, type_depense: e.target.value})}>
                            <option value="FIXE">Fixe</option>
                            <option value="COURANTE">Courante</option>
                            <option value="IMPREVUE">Imprévue</option>
                        </select>
                        <select style={inputStyle} value={form.categorie_depense} onChange={e => setForm({...form, categorie_depense: e.target.value})}>
                            <option value="ALIMENTATION">Alimentation</option>
                            <option value="LOGEMENT">Logement</option>
                            <option value="SANTE">Santé</option>
                            <option value="TRANSPORT">Transport</option>
                            <option value="EDUCATION">Education</option>
                            <option value="LOISIR">Loisir</option>
                            <option value="AUTRE">Autre</option>
                        </select>
                        <input style={inputStyle} type="number" placeholder="Montant" value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} required />
                        <input style={inputStyle} type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                        <select style={inputStyle} value={form.mode_paiement} onChange={e => setForm({...form, mode_paiement: e.target.value})}>
                            <option value="CASH">Cash (Espèces)</option>
                            <option value="MOBILE_MONEY">Mobile Money</option>
                            <option value="BANQUE">Banque</option>
                            <option value="DETTE">Dette</option>
                        </select>
                        <textarea style={inputStyle} placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" style={{ flex: 1, padding: '10px', background: '#27ae60', color: 'white' }}>Ajouter</button>
                            <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: '#95a5a6', color: 'white' }}>Fermer</button>
                        </div>
                    </form>
            </Modal>

            <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', minWidth: '800px' }}>
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
                        {expenses.length > 0 ? expenses.map((exp) => (
                            <tr key={exp.id_depense} style={{ borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                                <td style={{ padding: '10px' }}>{new Date(exp.date_depense).toLocaleDateString()}</td>
                                <td>{exp.categorie_depense}</td>
                                <td>{exp.montant} $</td>
                                <td>{exp.mode_paiement}</td>
                                <td>{exp.description}</td>
                                <td>{exp.prenom} {exp.nom}</td>
                                <td>{exp.nom_famille}</td>
                            </tr>
                        )) : <tr><td colSpan="7" style={{ padding: '20px' }}>Aucune dépense enregistrée.</td></tr>}
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

export default Expenses;