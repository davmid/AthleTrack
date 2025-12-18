import React, { useState } from 'react';
import { API_BASE_URL, type LoginDto, type AuthResponse }  from './api';

// Przyjmuje prop 'onAuthSuccess' do przekierowania po zalogowaniu
interface LoginProps {
    onAuthSuccess: (token: string) => void;
    onNavigateRegister: () => void;
}

const LoginScreen: React.FC<LoginProps> = ({ onAuthSuccess, onNavigateRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const loginData: LoginDto = { email, password };

        try {
            const response = await fetch(`${API_BASE_URL}/Auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });

            const data: AuthResponse = await response.json();

            if (response.ok) {
                onAuthSuccess(data.token);
            } else {
                setError(`Logowanie nieudane}`);
            }
        } catch (err) {
            setError('Błąd sieci/CORS. Upewnij się, że API działa na porcie 5079.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-left-panel">
                <h1 className="logo">AthleTrack</h1>
                <h2 className="welcome-text">
                    Witaj! <br/> Trenuj Ciężko. Zostań Silny.
                </h2>

                <form onSubmit={handleLogin} className="auth-form">
                    {/* Pole Email */}
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
                    
                    {/* Pole Hasło */}
                    <input type="password" placeholder="Hasło" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                    
                    <button type="submit" className="neon-button" disabled={loading}>
                        {loading ? 'Logowanie...' : 'Log In'}
                    </button>
                    
                    {error && <p className="error-message">{error}</p>}
                </form>

                <p className="link-text">
                    Nie masz konta? <span onClick={onNavigateRegister} className="neon-link">Zarejestruj się</span>
                </p>
            </div>
            
            <div className="auth-right-panel">
                <h3 className="stats-text">500K+ users. <br/> 50M+ workouts logged.</h3>
                {/* Reprezentacja grafiki siatki 3D */}
                <div className="torso-graphic">
                     
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;