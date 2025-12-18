import React, { useState, useEffect } from 'react';
import { API_BASE_URL, type BodyMetric, type NewBodyMetricDto, type UserDto } from './api';

interface UserProfileProps {
    token: string;
    user: UserDto | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ token, user }) => {
    const [lastMetric, setLastMetric] = useState<BodyMetric | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Stan formularza
    const [formData, setFormData] = useState<NewBodyMetricDto>({
        weightKg: null,
        bodyFatPercent: null,
        waistCm: null,
        chestCm: null,
        bicepsCm: null,
        notes: ''
    });

    useEffect(() => {
        fetchLastMetric();
    }, []);

    const fetchLastMetric = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/BodyMetrics/last`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLastMetric(data);
                setFormData({
                    weightKg: data.weightKg,
                    bodyFatPercent: data.bodyFatPercent,
                    waistCm: data.waistCm,
                    chestCm: data.chestCm,
                    bicepsCm: data.bicepsCm,
                    notes: ''
                });
            }
        } catch (error) {
            console.error("Błąd pobierania metryk:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/BodyMetrics`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    measurementDate: new Date().toISOString()
                })
            });

            if (response.ok) {
                alert("Metryki zaktualizowane!");
                setIsEditing(false);
                fetchLastMetric();
            }
        } catch (error) {
            alert("Błąd zapisu.");
        }
    };

    if (loading) return <p>Ładowanie profilu...</p>;

    return (
        <div className="profile-container" style={{ padding: '20px', color: 'white' }}>
            <h1>Profil Użytkownika</h1>
            <div className="user-info-card" style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #333' }}>
                <p><strong>Imię i Nazwisko:</strong> {user?.firstName} {user?.lastName}</p>
                <p><strong>Email:</strong> {user?.email}</p>
            </div>

            <h2>Moje Metryki Ciała</h2>
            
            {!isEditing ? (
                <div className="metrics-display" style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #00ff88' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <p>Waga: <strong>{lastMetric?.weightKg || '--'} kg</strong></p>
                        <p>Body Fat: <strong>{lastMetric?.bodyFatPercent || '--'} %</strong></p>
                        <p>Pas: <strong>{lastMetric?.waistCm || '--'} cm</strong></p>
                        <p>Biceps: <strong>{lastMetric?.bicepsCm || '--'} cm</strong></p>
                    </div>
                    <button onClick={() => setIsEditing(true)} className="neon-button" style={{ marginTop: '15px' }}>
                        Aktualizuj Pomiary
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSave} className="workout-form" style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px' }}>
                    <label>Waga (kg)</label>
                    <input type="number" step="0.1" value={formData.weightKg || ''} 
                        onChange={e => setFormData({...formData, weightKg: parseFloat(e.target.value)})} />
                    
                    <label>Body Fat (%)</label>
                    <input type="number" step="0.1" value={formData.bodyFatPercent || ''} 
                        onChange={e => setFormData({...formData, bodyFatPercent: parseFloat(e.target.value)})} />
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label>Pas (cm)</label>
                            <input type="number" step="0.1" value={formData.waistCm || ''} 
                                onChange={e => setFormData({...formData, waistCm: parseFloat(e.target.value)})} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Biceps (cm)</label>
                            <input type="number" step="0.1" value={formData.bicepsCm || ''} 
                                onChange={e => setFormData({...formData, bicepsCm: parseFloat(e.target.value)})} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="submit" className="neon-button">Zapisz zmiany</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">Anuluj</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default UserProfile;