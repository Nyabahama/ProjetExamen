import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [nom, setNom] = useState('');
    const [nomFamille, setNomFamille] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${apiUrl}/api/auth/login`, { nom, nomFamille });
            if (res.data.user) {
                login(res.data.user);
                navigate('/');
                toast.success(`Bienvenue ${res.data.user.prenom} !`);
            } else {
                toast.error('Informations incorrectes');
            }
        } catch (error) {
            const msg = error.response?.data?.error || "Impossible de joindre le serveur. Vérifiez votre connexion.";
            toast.error(msg);
        }
    };

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <h2>Connexion Ménage</h2>
                <div style={{ marginBottom: '15px' }}>
                    <label>Votre Nom :</label>
                    <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label>Nom de votre Famille :</label>
                    <input type="text" value={nomFamille} onChange={(e) => setNomFamille(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Se Connecter
                </button>
                <div className="login-link">
                    <a href="/register">Pas encore de compte ? Inscrivez-vous</a>
                </div>
            </form>
        </div>
    );
};

export default Login;