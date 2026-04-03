import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/metier/Dashboard';
import Members from './pages/metier/Members';
import Expenses from './pages/metier/Expenses';
import Revenues from './pages/metier/Revenues';
import Avoir from './pages/metier/Avoir';
import Besoins from './pages/metier/Besoins';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/membres" element={<PrivateRoute><Members /></PrivateRoute>} />
                    <Route path="/depenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
                    <Route path="/revenus" element={<PrivateRoute><Revenues /></PrivateRoute>} />
                    <Route path="/avoirs" element={<PrivateRoute><Avoir /></PrivateRoute>} />
                    <Route path="/besoins" element={<PrivateRoute><Besoins /></PrivateRoute>} />

                    {/* Redirection par défaut */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;