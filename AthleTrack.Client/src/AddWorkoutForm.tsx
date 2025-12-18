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
    const [durationMinutes, setDurationMinutes] = useState(60);
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
            const startDatetime = `${date}T10:00:00Z`; 

            const newWorkout: NewWorkoutDto = {
                name: name.trim(),
                date: startDatetime,
                durationMinutes: durationMinutes,
                notes: notes.trim(),
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
                alert(`Trening "${newWorkout.name}" zaplanowany pomyślnie!`);
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
            <h2>➕ Dodaj Nowy Trening / Zaplanuj</h2>

            <form onSubmit={handleSubmit} className="workout-form">
                
                <label>Nazwa Treningu</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

                <label>Data</label>
                <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    required 
                />

                <label>Czas trwania (minuty)</label>
                <input 
                    type="number" 
                    value={durationMinutes} 
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)} 
                    min="1"
                    required 
                />

                <label>Notatki</label>
                <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    rows={4} 
                    placeholder="Cele, uwagi, planowane ćwiczenia..." 
                />
                
                {error && <p className="error-message">{error}</p>}

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" className="neon-button" disabled={loading || !name.trim() || durationMinutes < 1}>
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