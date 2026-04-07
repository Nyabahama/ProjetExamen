import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Ménage
    pays: '', ville: '', commune: '', quartier: '', avenue: '', numero_avenue: '',
    // Famille
    nomFamille: '',
    // Personne
    nom: '', prenom: '', date_naissance: '', sexe: 'M', statut_familial: '', telephone: '', email: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/auth/register`, formData);
      toast.success(res.data.success || "Inscription réussie !");
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erreur lors de l'inscription";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="login-page">
      <div className="register-card">
        <h2>Inscription - Étape {step}/3</h2>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
          {step === 1 && "Identification du Ménage (Localisation)"}
          {step === 2 && "Identification de la Famille"}
          {step === 3 && "Identification de la Personne"}
        </p>

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          {step === 1 && (
            <div className="form-step">
              <input type="text" name="pays" placeholder="Pays" value={formData.pays} onChange={handleChange} required />
              <input type="text" name="ville" placeholder="Ville" value={formData.ville} onChange={handleChange} required />
              <input type="text" name="commune" placeholder="Commune" value={formData.commune} onChange={handleChange} required />
              <input type="text" name="quartier" placeholder="Quartier" value={formData.quartier} onChange={handleChange} required />
              <input type="text" name="avenue" placeholder="Avenue" value={formData.avenue} onChange={handleChange} required />
              <input type="number" name="numero_avenue" placeholder="Numéro d'avenue" value={formData.numero_avenue} onChange={handleChange} required />
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <input type="text" name="nomFamille" placeholder="Nom de la Famille" value={formData.nomFamille} onChange={handleChange} required />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={prevStep} style={{ background: '#95a5a6' }}>Retour</button>
                <button type="submit">Suivant</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <input type="text" name="nom" placeholder="Votre Nom" value={formData.nom} onChange={handleChange} required />
              <input type="text" name="prenom" placeholder="Votre Prénom" value={formData.prenom} onChange={handleChange} required />
              <label style={{ fontSize: '0.8rem', display: 'block', textAlign: 'left', marginTop: '10px' }}>Date de naissance :</label>
              <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} required />
              
              <select name="sexe" value={formData.sexe} onChange={handleChange} required style={{ width: '100%', padding: '10px', margin: '10px 0' }}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>

              <input type="text" name="statut_familial" placeholder="Statut (ex: Père, Enfant...)" value={formData.statut_familial} onChange={handleChange} required />
              <input type="tel" name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={prevStep} style={{ background: '#95a5a6' }}>Retour</button>
                <button type="submit">Finaliser l'inscription</button>
              </div>
            </div>
          )}

          {step === 1 && <button type="submit" style={{ marginTop: '10px' }}>Suivant</button>}
        </form>

        <div className="register-link">
          <a href="/login">Déjà un compte ? Se connecter</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
