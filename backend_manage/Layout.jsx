import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/App.css';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-container">
            <nav className="sidebar">
                <h3>Gestion Ménage</h3>
                <ul>
                    <li><Link to="/">Tableau de bord</Link></li>
                    <li><Link to="/membres">Membres</Link></li>
                    <li><Link to="/depenses">Dépenses</Link></li>
                    <li><Link to="/revenus">Revenus</Link></li>
                </ul>
            </nav>

            <div className="main-content">
                <header className="navbar">
                    <div className="user-info">
                        <strong>Utilisateur : </strong> {user?.prenom} {user?.nom} | 
                        <strong> Famille : </strong> {user?.nom_famille}
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        Se déconnecter
                    </button>
                </header>
                <main className="container">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;