import React, { useState, useEffect } from 'react';
import { API_BASE_URL, type Exercise, type NewExerciseDto } from './api';

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
    const [defaultReps, setDefaultReps] = useState('12'); // Add state for default reps
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
                setError(`Błąd pobierania ćwiczeń: Status ${response.status}`);
            }
        } catch (err) {
            setError('Błąd sieci podczas ładowania biblioteki ćwiczeń.');
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

        console.log('Sending new exercise:', newExercise);

        try {
            const response = await fetch(`${API_BASE_URL}/Exercises`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newExercise),
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response body:', responseText);

            if (response.ok) {
                setIsAdding(false);
                setNewName('');
                fetchExercises();
            } else {
                let errorMessage = 'Błąd walidacji danych.';
                try {
                    const data = JSON.parse(responseText);
                    errorMessage = data.title || errorMessage;
                } catch {
                    errorMessage = responseText || errorMessage;
                }
                setAddError(errorMessage);
            }
        } catch (err) {
            console.error('Network error:', err);
            setAddError('Błąd sieci podczas dodawania.');
        } finally {
            setAddLoading(false);
        }
    };

    const renderAddForm = () => (
        <div className="form-container">
            <h3>➕ Dodaj Nowe Ćwiczenie do Biblioteki</h3>
            <form onSubmit={handleAddExercise}>
                <label>Nazwa Ćwiczenia</label>
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                />

                <label style={{ marginTop: '15px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={newIsCardio}
                        onChange={(e) => setNewIsCardio(e.target.checked)}
                        style={{ marginRight: '10px' }}
                    />
                    To jest ćwiczenie Cardio
                </label>

                {!newIsCardio && (
                    <>
                        <label style={{ marginTop: '15px' }}>Główna Grupa Mięśniowa</label>
                        <select
                            value={newMuscleGroup}
                            onChange={(e) => setNewMuscleGroup(e.target.value)}
                            required
                        >
                            {MUSCLE_GROUPS.filter(g => g !== 'Cardio').map(group => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>
                    </>
                )}

                <label style={{ marginTop: '15px' }}>Domyślna liczba powtórzeń</label>
                <input
                    type="number"
                    value={defaultReps}
                    onChange={(e) => setDefaultReps(e.target.value)}
                    min="1"
                />

                {addError && <p className="error-message">{addError}</p>}

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" className="neon-button" disabled={addLoading || !newName.trim()}>
                        {addLoading ? 'Zapisywanie...' : 'Zapisz Ćwiczenie'}
                    </button>
                    <button type="button" onClick={() => setIsAdding(false)} className="cancel-button">
                        Anuluj
                    </button>
                </div>
            </form>
        </div>
    );

    const renderList = () => (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>💪 Biblioteka Ćwiczeń ({exercises.length})</h2>
                <button className="neon-button-mini" onClick={() => setIsAdding(true)}>+ Dodaj Nowe</button>
            </div>

            {loading ? (
                <div className="loading-screen">Ładowanie ćwiczeń...</div>
            ) : error ? (
                <div className="error-screen">Błąd: {error}</div>
            ) : exercises.length === 0 ? (
                <p style={{ color: '#ccc' }}>Brak ćwiczeń w bibliotece. Dodaj pierwsze!</p>
            ) : (
                <div className="exercise-grid">
                    {exercises.map(e => (
                        <div key={e.id} className="exercise-card">
                            <div className="card-header">
                                <h3 style={{ margin: 0 }}>{e.name} {e.isCardio && <span className="cardio-tag">🏃</span>}</h3>
                            </div>
                            <p className="muscle-group" style={{ marginTop: '10px', color: '#888' }}>
                                Grupa: <strong style={{ color: '#00FF00' }}>{e.muscleGroup}</strong>
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    return (
        <div className="list-container">
            <button onClick={onBack} className="back-button">← Powrót do Dashboardu</button>

            <div style={{ marginTop: '20px' }}>
                {isAdding ? renderAddForm() : renderList()}
            </div>
        </div>
    );
};

export default ExerciseManagementScreen;