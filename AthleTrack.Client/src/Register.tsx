import React, { useState } from 'react';
import { API_BASE_URL, type RegistrationDto } from './api';

interface RegisterProps {
    onNavigateLogin: () => void;
}

const RegisterScreen: React.FC<RegisterProps> = ({ onNavigateLogin }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | string[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const validateForm = () => {
        if (!email.includes('@')) return "Nieprawidłowy format adresu email.";
        if (password.length < 8) return "Hasło musi mieć co najmniej 8 znaków.";
        if (!/[A-Z]/.test(password)) return "Hasło musi zawierać dużą literę.";
        if (!/[0-9]/.test(password)) return "Hasło musi zawierać cyfrę.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Hasło musi zawierać znak specjalny.";
        return null;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const frontendError = validateForm();
        if (frontendError) {
            setError(frontendError);
            return;
        }

        setLoading(true);
        const registrationData: RegistrationDto = { firstName, lastName, email, password };

        try {
            const response = await fetch(`${API_BASE_URL}/Auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                if (data.errors && Array.isArray(data.errors)) {
                    setError(data.errors.map((err: any) => err.description || err));
                } 
                else if (data.errors && typeof data.errors === 'object') {
                    const messages = Object.values(data.errors).flat() as string[];
                    setError(messages);
                }
                else {
                    setError(data.message || 'Rejestracja nieudana. Email może być już zajęty.');
                }
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem. Upewnij się, że API działa.');
        } finally {
            setLoading(false);
        }
    };

    const renderError = () => {
        if (!error) return null;
        if (Array.isArray(error)) {
            return (
                <ul className="error-list">
                    {error.map((msg, idx) => <li key={idx} className="error-message">{msg}</li>)}
                </ul>
            );
        }
        return <p className="error-message">{error}</p>;
    };

    if (success) {
        return (
            <div className="auth-container success-screen">
                <div className="auth-left-panel">
                    <h1 className="logo">AthleTrack</h1>
                    <h2 className="welcome-text" style={{ color: '#00FF88' }}>Sukces!</h2>
                    <p className="success-message">Konto zostało utworzone. Możesz się teraz zalogować.</p>
                    <button className="neon-button" onClick={onNavigateLogin} style={{ width: '100%', marginTop: '20px' }}>
                        Przejdź do logowania
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-left-panel">
                <h1 className="logo">AthleTrack</h1>
                <h2 className="welcome-text">Dołącz do Społeczności.</h2>

                <form onSubmit={handleRegister} className="auth-form">
                    <div className="auth-input-group">
                        <label>Imię</label>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={loading} />
                    </div>

                    <div className="auth-input-group">
                        <label>Nazwisko</label>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={loading} />
                    </div>

                    <div className="auth-input-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
                    </div>

                    <div className="auth-input-group">
                        <label>Hasło</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                        <p className="hint-text">Min. 8 znaków, duża litera, cyfra i znak specjalny.</p>
                    </div>
                    {renderError()}
                    <button type="submit" className="neon-button" disabled={loading}>
                        {loading ? 'Przetwarzanie...' : 'Zarejestruj się'}
                    </button>
                </form>

                <p className="link-text">
                    Masz już konto? <span onClick={onNavigateLogin} className="neon-link">Zaloguj się</span>
                </p>
            </div>
            
            <div className="auth-right-panel">
                <h3 className="stats-text">Define Your <br />
                <span style={{ color: '#00FF88' }}>Next Limit.</span></h3>
            </div>
        </div>
    );
};

export default RegisterScreen;