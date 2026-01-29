import React, { useState, useEffect } from 'react';
import { API_BASE_URL, type BodyMetric, type NewBodyMetricDto, type UserDto } from './api';
import { User, Scale, Activity, Ruler, Save, X, Edit3 } from 'lucide-react';

interface UserProfileProps {
    token: string;
    user: UserDto | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ token, user }) => {
    const [lastMetric, setLastMetric] = useState<BodyMetric | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState<NewBodyMetricDto>({
        weightKg: null,
        bodyFatPercent: null,
        waistCm: null,
        chestCm: null,
        bicepsCm: null,
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
                setIsEditing(false);
                fetchLastMetric();
            }
        } catch (error) {
            alert("Błąd zapisu.");
        }
    };

    if (loading) return <div className="dashboard-content">Ładowanie profilu...</div>;

    return (
        <div className="dashboard-content">
            <div className="dashboard-header">
                <h2 style={{ color: '#00FF88', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <User size={28} /> Profil Użytkownika
                </h2>
            </div>

            <div className="stat-card" style={{ marginBottom: '20px' }}>
                <div className="stat-label">Zalogowany jako</div>
                <div className="stat-value" style={{ fontSize: '24px' }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ color: '#888', marginTop: '5px' }}>{user?.email}</div>
            </div>

            <div className="dashboard-header">
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                    <Activity size={20} color="#00FF88" /> Moje Metryki Ciała
                </h3>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="refresh-button" style={{ borderColor: '#00FF88', color: '#00FF88' }}>
                        <Edit3 size={14} /> Aktualizuj dane
                    </button>
                )}
            </div>

            {!isEditing ? (
                <div className="stats-grid" style={{ marginTop: '10px' }}>
                    <div className="stat-card" style={{ borderLeft: '4px solid #00d4ff' }}>
                        <div className="stat-label"><Scale size={14} /> Waga</div>
                        <div className="stat-value">{lastMetric?.weightKg || '--'} <span style={{ fontSize: '14px', color: '#666' }}>kg</span></div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '4px solid #ff4444' }}>
                        <div className="stat-label"><Activity size={14} /> Body Fat</div>
                        <div className="stat-value">{lastMetric?.bodyFatPercent || '--'} <span style={{ fontSize: '14px', color: '#666' }}>%</span></div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '4px solid #00FF88' }}>
                        <div className="stat-label"><Ruler size={14} /> Pas</div>
                        <div className="stat-value">{lastMetric?.waistCm || '--'} <span style={{ fontSize: '14px', color: '#666' }}>cm</span></div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '4px solid #ffcc00' }}>
                        <div className="stat-label"><Ruler size={14} /> Klatka</div>
                        <div className="stat-value">{lastMetric?.chestCm || '--'} <span style={{ fontSize: '14px', color: '#666' }}>cm</span></div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '4px solid #a155ff' }}>
                        <div className="stat-label"><Ruler size={14} /> Biceps</div>
                        <div className="stat-value">{lastMetric?.bicepsCm || '--'} <span style={{ fontSize: '14px', color: '#666' }}>cm</span></div>
                    </div>
                </div>
            ) : (
                <div className="form-container" style={{ maxWidth: '100%', marginTop: '10px' }}>
                    <form onSubmit={handleSave} className="workout-form">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div>
                                <label>Waga (kg)</label>
                                <input type="number" step="0.1" value={formData.weightKg || ''}
                                    onChange={e => setFormData({ ...formData, weightKg: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label>Body Fat (%)</label>
                                <input type="number" step="0.1" value={formData.bodyFatPercent || ''}
                                    onChange={e => setFormData({ ...formData, bodyFatPercent: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label>Pas (cm)</label>
                                <input type="number" step="0.1" value={formData.waistCm || ''}
                                    onChange={e => setFormData({ ...formData, waistCm: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label>Klatka (cm)</label>
                                <input type="number" step="0.1" value={formData.chestCm || ''}
                                    onChange={e => setFormData({ ...formData, chestCm: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label>Biceps (cm)</label>
                                <input type="number" step="0.1" value={formData.bicepsCm || ''}
                                    onChange={e => setFormData({ ...formData, bicepsCm: parseFloat(e.target.value) })} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                            <button type="submit" className="neon-button" style={{ flex: 2 }}>
                                <Save size={18} /> Zapisz zmiany
                            </button>
                            <button type="button" onClick={() => setIsEditing(false)} className="back-button" style={{ flex: 1 }}>
                                <X size={18} /> Anuluj
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default UserProfile;