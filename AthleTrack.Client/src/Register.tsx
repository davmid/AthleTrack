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
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        setSuccess(false);

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
                // Backend zwraca błędy walidacji Identity
                setError(`Rejestracja nieudana: ${data.message || data.errors || 'Sprawdź, czy email jest unikalny.'}`);
            }
        } catch (err) {
            setError('Błąd sieci/CORS. Upewnij się, że API działa na porcie 5079.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container success-screen">
                <div className="auth-left-panel">
                    <h1 className="logo">AthleTrack.</h1>
                    <h2 className="welcome-text" style={{ color: '#00FF00' }}>Sukces!</h2>
                    <p className="success-message">Konto zostało pomyślnie utworzone. Możesz się teraz zalogować.</p>
                    <button className="neon-button" onClick={onNavigateLogin} style={{ width: '100%' }}>Przejdź do logowania</button>
                </div>
                <div className="auth-right-panel">
                    <h3 className="stats-text">Define Your <br/> Next Limit.</h3>
                    <div className="torso-graphic">
                        
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-left-panel">
                <h1 className="logo">AthleTrack</h1>
                <h2 className="welcome-text">
                    Zacznij Już Dziś! <br/> Dołącz do Społeczności.
                </h2>

                <form onSubmit={handleRegister} className="auth-form">
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" placeholder="Imię" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={loading} style={{ flex: 1 }} />
                        <input type="text" placeholder="Nazwisko" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={loading} style={{ flex: 1 }} />
                    </div>
                    
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
                    <input type="password" placeholder="Hasło (min. 8 znaków, duża/mała litera, cyfra)" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                    
                    <button type="submit" className="neon-button" disabled={loading}>
                        {loading ? 'Rejestracja...' : 'Register Account'}
                    </button>
                    
                    {error && <p className="error-message">{error}</p>}
                </form>

                <p className="link-text">
                    Masz już konto? <span onClick={onNavigateLogin} className="neon-link">Zaloguj się</span>
                </p>
            </div>

            <div className="auth-right-panel">
                <h3 className="stats-text">Define Your <br/> Next Limit.</h3>
                <div className="torso-graphic">
                     
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;