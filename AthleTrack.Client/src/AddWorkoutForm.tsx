import React, { useState } from 'react';
import { API_BASE_URL, type NewWorkoutDto } from './api';

interface AddWorkoutFormProps {
    token: string;
    onWorkoutAdded: () => void;
    onCancel: () => void;
}

const AddWorkoutForm: React.FC<AddWorkoutFormProps> = ({ token, onWorkoutAdded, onCancel }) => {
    const today = new Date().toISOString().substring(0, 10);
    
    const [name, setName] = useState('');
    const [date, setDate] = useState(today);
    const [durationMinutes, setDurationMinutes] = useState<number | string>(''); // Puste domyślnie
    const [reps, setReps] = useState<number | string>('');
    const [weightKg, setWeightKg] = useState<number | string>('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!name.trim()) {
            setError('Nazwa treningu jest wymagana.');
            setLoading(false);
            return;
        }

        try {
            // Formatuje datę do ISO, aby backend .NET poprawnie ją zmapował
            const startDatetime = `${date}T10:00:00Z`; 

            const newWorkout: NewWorkoutDto = {
                name: name.trim(),
                date: startDatetime,
                // Konwersja na null jeśli pole jest puste (zgodnie z nowym modelem API)
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
                alert(`Trening "${newWorkout.name}" zapisany pomyślnie!`);
                onWorkoutAdded(); 
            } else {
                const data = await response.json();
                const errorDetail = data.errors ? Object.values(data.errors).flat().join('; ') : (data.title || data.detail || `Status ${response.status}`);
                setError(`Błąd dodawania treningu: ${errorDetail}`);
            }
        } catch (err) {
            setError('Błąd sieci podczas zapisu treningu. Sprawdź połączenie z API.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>➕ Dodaj Nowy Trening / Sesję</h2>

            <form onSubmit={handleSubmit} className="workout-form">
                
                <label>Nazwa Treningu (np. Klatka + Biceps)</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

                <label>Data</label>
                <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    required 
                />

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label>Czas (min)</label>
                        <input 
                            type="number" 
                            value={durationMinutes} 
                            onChange={(e) => setDurationMinutes(e.target.value)} 
                            placeholder="Opcjonalnie"
                            min="0"
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Powtórzenia (łącznie)</label>
                        <input 
                            type="number" 
                            value={reps} 
                            onChange={(e) => setReps(e.target.value)} 
                            placeholder="Np. 50"
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Ciężar (kg)</label>
                        <input 
                            type="number" 
                            step="0.5"
                            value={weightKg} 
                            onChange={(e) => setWeightKg(e.target.value)} 
                            placeholder="Np. 82.5"
                        />
                    </div>
                </div>

                <label style={{ marginTop: '15px' }}>Notatki / Komentarz</label>
                <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    rows={3} 
                    placeholder="Jak się czułeś? Jakieś rekordy?" 
                />
                
                {error && <p className="error-message">{error}</p>}

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" className="neon-button" disabled={loading || !name.trim()}>
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