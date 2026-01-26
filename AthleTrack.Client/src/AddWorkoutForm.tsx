import React, { useState, useEffect } from 'react';
import { API_BASE_URL, type NewWorkoutDto } from './api';

interface Exercise {
    id: number;
    name: string;
    category?: string;
    userId?: number | null;
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

    const [name, setName] = useState('');
    const [date, setDate] = useState(today);
    const [durationMinutes, setDurationMinutes] = useState<number | string>(''); 
    const [reps, setReps] = useState<number | string>('');
    const [weightKg, setWeightKg] = useState<number | string>('');
    const [notes, setNotes] = useState('');
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
                } else {
                    console.error("Nie udało się pobrać listy ćwiczeń.");
                }
            } catch (err) {
                console.error("Błąd sieci podczas pobierania ćwiczeń:", err);
            } finally {
                setIsLoadingExercises(false);
            }
        };

        fetchExercises();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!name) {
            setError('Proszę wybrać ćwiczenie z listy.');
            setLoading(false);
            return;
        }

        try {
            const startDatetime = `${date}T10:00:00Z`; 

            const newWorkout: NewWorkoutDto = {
                name: name,
                date: startDatetime,
                durationMinutes: durationMinutes !== '' ? Number(durationMinutes) : null,
                reps: reps !== '' ? Number(reps) : null,
                weightKg: weightKg !== '' ? Number(weightKg) : null,
                notes: notes.trim() || undefined,
            };
            
            const response = await fetch(`${API_BASE_URL}/Workouts`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newWorkout),
            });

            if (response.ok) {
                alert(`Trening "${newWorkout.name}" zapisany!`);
                onWorkoutAdded(); 
            } else {
                const data = await response.json();
                const errorDetail = data.errors ? Object.values(data.errors).flat().join('; ') : (data.title || `Status ${response.status}`);
                setError(`Błąd dodawania: ${errorDetail}`);
            }
        } catch (err) {
            setError('Błąd sieci.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>➕ Dodaj Nowy Trening</h2>

            <form onSubmit={handleSubmit} className="workout-form">
                
                <label>Wybierz Ćwiczenie</label>
                <select 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required
                    disabled={isLoadingExercises}
                    style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #444' }}
                >
                    <option value="">-- {isLoadingExercises ? 'Ładowanie...' : 'Wybierz ćwiczenie'} --</option>
                    {availableExercises.map((ex) => (
                        <option key={ex.id} value={ex.name}>
                            {ex.name} {ex.category ? `[${ex.category}]` : ''}
                        </option>
                    ))}
                </select>

                <label style={{ marginTop: '15px' }}>Data</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label>Czas (min)</label>
                        <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder="Opcjonalnie" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Powtórzenia</label>
                        <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="Np. 50" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Ciężar (kg)</label>
                        <input type="number" step="0.5" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="Np. 80" />
                    </div>
                </div>

                <label style={{ marginTop: '15px' }}>Notatki / Komentarz</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Jak poszło?" />
                
                {error && <p className="error-message">{error}</p>}

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" className="neon-button" disabled={loading || !name}>
                        {loading ? 'Zapisywanie...' : 'Zapisz Trening'}
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-button">
                        Anuluj
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddWorkoutForm;