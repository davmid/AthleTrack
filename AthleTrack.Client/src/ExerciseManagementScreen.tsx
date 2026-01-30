import React, { useState, useEffect } from 'react';
import { API_BASE_URL, type Exercise, type NewExerciseDto } from './api';
import { Dumbbell, Plus, ChevronRight, Activity, ChevronLeft } from 'lucide-react';

interface ExerciseManagementProps {
    token: string;
    onBack: () => void;
}

const MUSCLE_GROUPS = [
    'Klatka piersiowa', 'Plecy', 'Nogi', 'Barki', 'Biceps', 'Triceps',
    'Brzuch/Core', 'Całe ciało', 'Cardio', 'Inne'
];

const ExerciseManagementScreen: React.FC<ExerciseManagementProps> = ({ token, onBack }) => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const [newName, setNewName] = useState('');
    const [newMuscleGroup, setNewMuscleGroup] = useState(MUSCLE_GROUPS[0]);
    const [newIsCardio, setNewIsCardio] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    const fetchExercises = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/Exercises`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data: Exercise[] = await response.json();
                data.sort((a, b) => a.name.localeCompare(b.name));
                setExercises(data);
            } else {
                setError(`Błąd pobierania danych.`);
            }
        } catch (err) {
            setError('Błąd sieci.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExercises();
    }, [token]);

    const handleAddExercise = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError(null);

        const newExercise: NewExerciseDto = {
            name: newName.trim(),
            muscleGroup: newIsCardio ? 'Cardio' : newMuscleGroup,
            isCardio: newIsCardio,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/Exercises`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newExercise),
            });

            if (response.ok) {
                setIsAdding(false);
                setNewName('');
                fetchExercises();
            } else {
                setAddError('Nie udało się zapisać ćwiczenia.');
            }
        } catch (err) {
            setAddError('Błąd połączenia.');
        } finally {
            setAddLoading(false);
        }
    };

    if (isAdding) {
        return (
            <div className="list-container">
                <button onClick={() => setIsAdding(false)} className="back-button">
                    <ChevronLeft size={18} /> Wróć do listy
                </button>

                <div className="form-card" style={{
                    background: '#1a1a1a',
                    padding: '30px',
                    borderRadius: '20px',
                    border: '1px solid #333',
                    marginTop: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                    <h2 style={{
                        color: '#00FF88',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '1.5rem',
                        marginBottom: '25px'
                    }}>
                        <div style={{
                            background: 'rgba(0, 255, 136, 0.1)',
                            padding: '8px',
                            borderRadius: '12px',
                            display: 'flex'
                        }}>
                            <Plus size={24} />
                        </div>
                        Nowe Ćwiczenie
                    </h2>

                    <form onSubmit={handleAddExercise} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="input-group">
                            <label style={{ color: '#888', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>
                                Nazwa ćwiczenia
                            </label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="np. Wyciskanie hantli"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: '#222',
                                    border: '1px solid #444',
                                    borderRadius: '10px',
                                    color: '#fff',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#00FF88'}
                                onBlur={(e) => e.target.style.borderColor = '#444'}
                            />
                        </div>

                        <div
                            onClick={() => setNewIsCardio(!newIsCardio)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: newIsCardio ? 'rgba(255, 104, 49, 0.1)' : '#222',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                border: `1px solid ${newIsCardio ? '#ff6831' : '#444'}`,
                                transition: 'all 0.3s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Activity size={20} color={newIsCardio ? '#ff6831' : '#888'} />
                                <span style={{ color: newIsCardio ? '#fff' : '#888' }}>Trening Cardio</span>
                            </div>
                            <div style={{
                                width: '40px',
                                height: '20px',
                                background: newIsCardio ? '#ff6831' : '#444',
                                borderRadius: '20px',
                                position: 'relative'
                            }}>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    background: '#fff',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '2px',
                                    left: newIsCardio ? '22px' : '2px',
                                    transition: 'all 0.3s'
                                }} />
                            </div>
                        </div>

                        {!newIsCardio && (
                            <div className="input-group" style={{ animation: 'fadeIn 0.4s ease' }}>
                                <label style={{ color: '#888', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>
                                    Grupa Mięśniowa
                                </label>
                                <select
                                    value={newMuscleGroup}
                                    onChange={(e) => setNewMuscleGroup(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        background: '#222',
                                        border: '1px solid #444',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        appearance: 'none'
                                    }}
                                >
                                    {MUSCLE_GROUPS.filter(g => g !== 'Cardio').map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {addError && (
                            <div style={{
                                color: '#ff4444',
                                background: 'rgba(255, 68, 68, 0.1)',
                                padding: '10px',
                                borderRadius: '8px',
                                fontSize: '0.9rem'
                            }}>
                                {addError}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                            <button
                                type="submit"
                                className="neon-button"
                                disabled={addLoading}
                                style={{ flex: 2, justifyContent: 'center' }}
                            >
                                {addLoading ? 'Zapisywanie...' : 'Dodaj do biblioteki'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="cancel-button"
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: '1px solid #444',
                                    color: '#888',
                                    borderRadius: '10px'
                                }}
                            >
                                Anuluj
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="list-container">
            <button onClick={onBack} className="back-button">
                <ChevronLeft size={18} />Powrót do Dashboardu
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#ff6831', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <Dumbbell size={28} /> Biblioteka Ćwiczeń ({exercises.length})
                </h2>
                <button className="neon-button-mini" onClick={() => setIsAdding(true)}>+ Dodaj</button>
            </div>

            {loading ? (
                <div className="loading-screen">Ładowanie biblioteki...</div>
            ) : error ? (
                <div className="error-screen">{error}</div>
            ) : exercises.length === 0 ? (
                <div className="empty-state">
                    <p>Twoja biblioteka jest pusta.</p>
                    <button className="neon-button" onClick={() => setIsAdding(true)} style={{ width: 'auto', padding: '12px 30px' }}>
                        Dodaj pierwsze ćwiczenie
                    </button>
                </div>
            ) : (
                <div className="upcoming-list">
                    {exercises.map((e) => (
                        <div key={e.id} className="upcoming-card history-card">
                            <div className="date-badge history-badge" style={{ background: e.isCardio ? '#ff6831' : '#00FF88', color: '#000' }}>
                                {e.isCardio ? <Activity size={16} /> : <Dumbbell size={16} />}
                            </div>

                            <div className="details">
                                <h3>{e.name}</h3>
                                <p>Grupa: <strong style={{ color: e.isCardio ? '#ff6831' : '#00FF88' }}>{e.muscleGroup}</strong></p>
                            </div>

                            <div className="card-action" style={{ marginLeft: 'auto' }}>
                                <ChevronRight size={24} color="#333" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExerciseManagementScreen;