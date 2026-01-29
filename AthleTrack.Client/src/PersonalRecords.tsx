import React, { useState, useEffect } from 'react';
import { API_BASE_URL, type PersonalRecordDto } from './api';
import { Trophy } from 'lucide-react';

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
                data.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
                setRecords(data);
            } else {
                setError(`Nie udało się pobrać rekordów.`);
            }
        } catch (err) {
            setError('Błąd sieci.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [token]);

    return (
        <div className="list-container">
            <button onClick={onBack} className="back-button">← Powrót do Dashboardu</button>

            <h2 style={{ color: '#d3ff32', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={28} /> Galeria Rekordów
            </h2>
            <button className="refresh-button" onClick={fetchRecords}>Odśwież</button>

            {loading ? (
                <div className="loading-state">Analizowanie Twoich osiągnięć...</div>
            ) : error ? (
                <div className="error-state">{error}</div>
            ) : records.length === 0 ? (
                <div className="empty-state">
                    <p>Brak rekordów. Czas podnieść coś ciężkiego! 🏋️</p>
                </div>
            ) : (
                <div className="records-grid">
                    {records.map((r, i) => (
                        <div key={i} className="record-card">
                            <div className="record-card-glow"></div>
                            <h3 className="exercise-title">{r.exerciseName}</h3>

                            <div className="main-stat">
                                <span className="stat-value">{r.maxWeight}</span>
                                <span className="stat-unit">kg</span>
                            </div>

                            <div className="record-details">
                                <span>Seria: <strong>{r.maxReps} powt.</strong></span>
                                <div className="one-rep-max">
                                    1RM: <strong>{r.EstimatedOneRepMax} kg</strong>
                                </div>
                            </div>

                            <div className="record-footer">
                                <span>{new Date(r.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PersonalRecords;