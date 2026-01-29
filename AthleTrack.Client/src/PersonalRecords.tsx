import React, { useState, useEffect } from 'react';
import { API_BASE_URL, type PersonalRecordDto } from './api';
import { ChevronLeft, Trophy, Zap, Map } from 'lucide-react';

interface PersonalRecordsProps {
    token: string;
    onBack: () => void;
}

const PersonalRecords: React.FC<PersonalRecordsProps> = ({ token, onBack }) => {
    const [records, setRecords] = useState<PersonalRecordDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRecords = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/Workouts/records`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data: PersonalRecordDto[] = await response.json();
                
                data.sort((a, b) => {
                    if (a.isCardio !== b.isCardio) return a.isCardio ? 1 : -1;
                    return a.exerciseName.localeCompare(b.exerciseName);
                });
                
                setRecords(data);
            } else {
                setError(`Błąd pobierania: ${response.status}`);
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [token]);

    return (
        <div className="list-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={onBack} className="back-button">
                    <ChevronLeft size={18} /> Powrót
                </button>
                <button className="refresh-button" onClick={fetchRecords}>Odśwież</button>
            </div>

            <h2 className="history-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#d3ff32' }}>
                <Trophy size={32} /> Galeria Rekordów
            </h2>

            {loading ? (
                <div className="loading-state">Pobieranie osiągnięć...</div>
            ) : error ? (
                <div className="error-state">{error}</div>
            ) : (
                <div className="records-grid">
                    {records.map((r, i) => {
    const isCardio = r.isCardio || (r.maxDistanceKm ?? 0) > 0;
    const accentColor = isCardio ? '#00d4ff' : '#00FF88';

    return (
        <div key={i} className="record-card" style={{ borderColor: `${accentColor}33` }}>
            <div className="record-card-glow" style={{ background: `radial-gradient(circle, ${accentColor}11 0%, transparent 70%)` }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="exercise-title" style={{ color: accentColor }}>{r.exerciseName}</h3>
                {isCardio ? <Map size={18} color="#00d4ff" /> : <Zap size={18} color="#00FF88" />}
            </div>

            <div className="main-stat">
                {isCardio ? (
                    <>
                        <span className="stat-value">{r.maxDistanceKm ?? 0}</span>
                        <span className="stat-unit">km</span>
                    </>
                ) : (
                    <>
                        <span className="stat-value">{r.maxWeight}</span>
                        <span className="stat-unit">kg</span>
                    </>
                )}
            </div>

            <div className="record-details">
                {isCardio ? (
                    <span style={{ color: '#888' }}>Rekord dystansu</span>
                ) : (
                    <>
                        <span>Seria: <strong>{r.maxReps} powt.</strong></span>
                        {(r.estimatedOneRepMax ?? 0) > 0 && (
                            <div className="one-rep-max" style={{ background: `${accentColor}1a`, color: accentColor }}>
                                Est. 1RM: <strong>{r.estimatedOneRepMax} kg</strong>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="record-footer">
                <span>{new Date(r.date).toLocaleDateString()}</span>
            </div>
        </div>
    );
})}
                </div>
            )}
        </div>
    );
};

export default PersonalRecords;