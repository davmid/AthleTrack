import React, { useState, useEffect } from 'react';
import { API_BASE_URL, type Exercise, type NewExerciseDto } from './api';
import { Dumbbell, Plus, ChevronRight, Activity } from 'lucide-react';

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
                <button onClick={() => setIsAdding(false)} className="back-button">← Wróć do listy</button>
                <div className="form-container" style={{ marginTop: '20px' }}>
                    <h2 style={{ color: '#00FF88', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Plus size={28} /> Nowe Ćwiczenie
                    </h2>
                    <form onSubmit={handleAddExercise}>
                        <label>Nazwa</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="np. Wyciskanie hantli"
                            required
                        />

                        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                id="cardio-check"
                                checked={newIsCardio}
                                onChange={(e) => setNewIsCardio(e.target.checked)}
                            />
                            <label htmlFor="cardio-check" style={{ margin: 0 }}>To ćwiczenie Cardio</label>
                        </div>

                        {!newIsCardio && (
                            <>
                                <label>Grupa Mięśniowa</label>
                                <select
                                    value={newMuscleGroup}
                                    onChange={(e) => setNewMuscleGroup(e.target.value)}
                                >
                                    {MUSCLE_GROUPS.filter(g => g !== 'Cardio').map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        {addError && <p className="error-screen" style={{ padding: '10px' }}>{addError}</p>}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                            <button type="submit" className="neon-button" disabled={addLoading}>
                                {addLoading ? 'Zapisywanie...' : 'Dodaj do biblioteki'}
                            </button>
                            <button type="button" onClick={() => setIsAdding(false)} className="cancel-button">Anuluj</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="list-container">
            <button onClick={onBack} className="back-button">← Powrót do Dashboardu</button>
            
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