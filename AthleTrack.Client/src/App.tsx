import React, { useState, useEffect } from 'react';
import LoginScreen from './Login';
import RegisterScreen from './Register';
import DashboardScreen from './Dashboard';
import './App.css';

type Screen = 'login' | 'register' | 'dashboard';

const App: React.FC = () => {
    // Token JWT
    const [token, setToken] = useState<string | null>(sessionStorage.getItem('authToken'));
    const [currentScreen, setCurrentScreen] = useState<Screen>(token ? 'dashboard' : 'login');

    // Uwierzytelnianie
    const handleLoginSuccess = (newToken: string) => {
        sessionStorage.setItem('authToken', newToken);
        setToken(newToken);
        setCurrentScreen('dashboard');
    };

    const handleLogout = () => {
        sessionStorage.removeItem('authToken');
        setToken(null);
        setCurrentScreen('login');
    };

    const renderScreen = () => {
        if (token && currentScreen === 'dashboard') {
            return <DashboardScreen token={token} onLogout={handleLogout} />;
        }
        
        if (currentScreen === 'register') {
            return <RegisterScreen onNavigateLogin={() => setCurrentScreen('login')} />;
        }
        
        return <LoginScreen 
            onAuthSuccess={handleLoginSuccess} 
            onNavigateRegister={() => setCurrentScreen('register')} 
        />;
    };

    return (
        <div className="app-main-container">
            {renderScreen()}
        </div>
    );
};

export default App;