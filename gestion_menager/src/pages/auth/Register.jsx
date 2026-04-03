import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [nom, setNom] = useState('');
  const [nomFamille, setNomFamille] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', { nom, nomFamille, password });
      alert('Inscription réussie. Connectez-vous maintenant.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l inscription');
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="register-card">
        <h2>Inscription</h2>
        <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
        <input type="text" placeholder="Nom de famille" value={nomFamille} onChange={(e) => setNomFamille(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" placeholder="Confirmer mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <button type="submit">S'inscrire</button>
        <div className="register-link">
          <a href="/login">Déjà un compte ? Se connecter</a>
        </div>
      </form>
    </div>
  );
};

export default Register;
