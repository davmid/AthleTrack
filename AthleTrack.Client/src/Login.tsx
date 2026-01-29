import React, { useState } from 'react';
import { API_BASE_URL, type LoginDto, type AuthResponse } from './api';

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

            // Sprawdzamy czy odpowiedź ma treść przed próba parsowania JSON
            const data: AuthResponse = await response.json();

            if (response.ok) {
                onAuthSuccess(data.token);
            } else {
                setError('Nieprawidłowy email lub hasło.');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem. Upewnij się, że API działa.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-left-panel">
                <div className="auth-form-container">
                    <h1 className="logo">AthleTrack<span>.</span></h1>
                    <h2 className="welcome-text">
                        Witaj! <br /> Trenuj Ciężko. Zostań Silny.
                    </h2>

                    <form onSubmit={handleLogin} className="auth-form">
                        <div className="auth-input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Wpisz swój email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="auth-input-group">
                            <label>Hasło</label>
                            <input
                                type="password"
                                placeholder="Wpisz hasło"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="neon-button" disabled={loading}>
                            {loading ? 'Autoryzacja...' : 'Log In'}
                        </button>

                        {error && <p className="error-message" style={{ color: '#ff4444', marginTop: '15px', fontSize: '14px' }}>{error}</p>}
                    </form>

                    <p className="link-text" style={{ marginTop: '20px', color: '#888' }}>
                        Nie masz konta? <span onClick={onNavigateRegister} className="neon-link" style={{ color: '#00FF88', cursor: 'pointer', fontWeight: 'bold' }}>Zarejestruj się</span>
                    </p>
                </div>
            </div>

            <div className="auth-right-panel">
                <h3 className="stats-text" style={{ fontSize: '24px', color: '#fff' }}>
                    500K+ users. <br />
                    <span style={{ color: '#00FF88' }}>50M+ workouts logged.</span>
                </h3>
            </div>
        </div>
    );
};

export default LoginScreen;