import React, { useState, useEffect } from 'react';
import { API_BASE_URL, type NewWorkoutDto, type WorkoutSetDto } from './api';
import { Trash2, Plus, Dumbbell, Timer, Map } from 'lucide-react';

interface Exercise {
    id: number;
    name: string;
    muscleGroup: string;
    isCardio: boolean;
}

interface AddWorkoutFormProps {
    token: string;
    onWorkoutAdded: () => void;
    onCancel: () => void;
}

const AddWorkoutForm: React.FC<AddWorkoutFormProps> = ({ token, onWorkoutAdded, onCancel }) => {
    const today = new Date().toISOString().substring(0, 10);

    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
    const [isLoadingExercises, setIsLoadingExercises] = useState(false);

    const [workoutName, setWorkoutName] = useState('');
    const [date, setDate] = useState(today);
    const [notes, setNotes] = useState('');

    const [sets, setSets] = useState<any[]>([
        { setNumber: 1, exerciseId: 0, isCardio: false, weightKg: null, reps: null, distanceKm: null, timeSeconds: null, uiMinutes: '' }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExercises = async () => {
            setIsLoadingExercises(true);
            try {
                const response = await fetch(`${API_BASE_URL}/Exercises`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setAvailableExercises(data);
                }
            } catch (err) {
                console.error("Błąd pobierania ćwiczeń:", err);
            } finally {
                setIsLoadingExercises(false);
            }
        };
        fetchExercises();
    }, [token]);

    const addSet = () => {
        const lastSet = sets[sets.length - 1];
        setSets([...sets, {
            ...lastSet,
            setNumber: sets.length + 1,
        }]);
    };

    const updateSet = (index: number, field: string, value: any) => {
        const newSets = [...sets];

        if (field === 'exerciseId') {
            const ex = availableExercises.find(x => x.id === Number(value));
            newSets[index] = {
                ...newSets[index],
                exerciseId: Number(value),
                isCardio: ex?.isCardio || false,
                weightKg: null, reps: null, distanceKm: null, timeSeconds: null, uiMinutes: ''
            };
        } else if (field === 'uiMinutes') {
            const mins = value === '' ? 0 : Number(value);
            newSets[index] = {
                ...newSets[index],
                uiMinutes: value,
                timeSeconds: mins * 60
            };
        } else {
            newSets[index] = {
                ...newSets[index],
                [field]: value === '' ? null : (field === 'distanceKm' || field === 'weightKg' ? parseFloat(value) : parseInt(value))
            };
        }
        setSets(newSets);
    };

    const removeSet = (index: number) => {
        if (sets.length <= 1) return;
        setSets(sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, setNumber: i + 1 })));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workoutName.trim()) { setError('Podaj nazwę sesji.'); return; }
        if (sets.some(s => !s.exerciseId)) { setError('Wybierz ćwiczenie dla każdej serii.'); return; }

        setLoading(true);
        setError(null);

        try {
            const newWorkout: NewWorkoutDto = {
                name: workoutName,
                date: `${date}T10:00:00Z`,
                notes: notes.trim() || undefined,
                workoutSets: sets.map(s => ({
                    exerciseId: Number(s.exerciseId),
                    setNumber: s.setNumber,
                    weightKg: s.isCardio ? null : (parseFloat(s.weightKg) || 0),
                    reps: s.isCardio ? null : (parseInt(s.reps) || 0),
                    distanceKm: s.isCardio ? (parseFloat(s.distanceKm) || 0) : null,
                    timeSeconds: s.isCardio ? (parseInt(s.timeSeconds) || 0) : null
                })) as WorkoutSetDto[]
            };

            const response = await fetch(`${API_BASE_URL}/Workouts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newWorkout),
            });

            if (response.ok) {
                onWorkoutAdded();
            } else {
                const errorData = await response.json();
                console.error("Szczegóły błędu serwera:", errorData);
                setError('Błąd zapisu. Sprawdź czy wszystkie dane są poprawne.');
            }
        } catch (err) {
            setError('Błąd połączenia z API.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container fade-in">
            <h2>➕ Nowy ing</h2>

            <form onSubmit={handleSubmit} className="workout-form">
                <div className="form-group">
                    <label>Nazwa sesji</label>
                    <input
                        type="text"
                        placeholder="np. Push Day, Bieganie wieczorne..."
                        value={workoutName}
                        onChange={(e) => setWorkoutName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Data</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>

                <div className="sets-section">
                    <label>Ćwiczenia i Serie</label>
                    {sets.map((set, index) => (
                        <div key={index} className="set-row-card">
                            <div className="set-header">
                                <span className="set-badge">#{set.setNumber}</span>
                                <select
                                    value={set.exerciseId || ''}
                                    onChange={(e) => updateSet(index, 'exerciseId', e.target.value)}
                                    required
                                >
                                    <option value="">-- Wybierz ćwiczenie --</option>
                                    {availableExercises.map(ex => (
                                        <option key={ex.id} value={ex.id}>
                                            {ex.name} {ex.isCardio ? '(Cardio)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="set-inputs">
                                {set.isCardio ? (
                                    <>
                                        <div className="input-wrapper">
                                            <Timer size={16} className="input-icon" />
                                            <input
                                                type="number"
                                                placeholder="minuty"
                                                value={set.uiMinutes}
                                                onChange={(e) => updateSet(index, 'uiMinutes', e.target.value)}
                                            />
                                        </div>
                                        <div className="input-wrapper">
                                            <Map size={16} className="input-icon" />
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder="km"
                                                value={set.distanceKm ?? ''}
                                                onChange={(e) => updateSet(index, 'distanceKm', e.target.value)}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="input-wrapper">
                                            <Dumbbell size={16} className="input-icon" />
                                            <input
                                                type="number"
                                                step="0.25"
                                                placeholder="kg"
                                                value={set.weightKg ?? ''}
                                                onChange={(e) => updateSet(index, 'weightKg', e.target.value)}
                                            />
                                        </div>
                                        <div className="input-wrapper">
                                            <Plus size={16} className="input-icon" />
                                            <input
                                                type="number"
                                                placeholder="powt."
                                                value={set.reps ?? ''}
                                                onChange={(e) => updateSet(index, 'reps', e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

                                {sets.length > 1 && (
                                    <button type="button" onClick={() => removeSet(index)} className="delete-set-btn">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <button type="button" onClick={addSet} className="add-set-button">
                        <Plus size={18} /> Dodaj kolejną serię
                    </button>
                </div>

                <div className="form-group">
                    <label>Notatki</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Opcjonalne uwagi..."
                        rows={2}
                    />
                </div>

                {error && <div className="error-box">{error}</div>}

                <div className="form-footer">
                    <button type="submit" className="save-button" disabled={loading}>
                        {loading ? 'Szykowanie...' : 'ZAPISZ TRENING'}
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-button">Anuluj</button>
                </div>
            </form>
        </div>
    );
};

export default AddWorkoutForm;