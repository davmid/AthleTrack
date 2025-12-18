import React, { useState, useEffect } from 'react';
import {
    API_BASE_URL,
    type NewTrainingPlanDto,
    type PlanItem,
    type Exercise 
} from './api';

interface AddPlanItemProps {
    availableExercises: Exercise[];
    onAddItem: (item: PlanItem) => void;
    onCancel: () => void;
}

const AddPlanItemForm: React.FC<AddPlanItemProps> = ({ availableExercises, onAddItem, onCancel }) => {
    const [selectedExerciseId, setSelectedExerciseId] = useState(0);
    const [sets, setSets] = useState(3);
    const [reps, setReps] = useState(10);
    const [targetWeight, setTargetWeight] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (availableExercises.length > 0 && selectedExerciseId === 0) {
            setSelectedExerciseId(availableExercises[0].id);
        }
    }, [availableExercises, selectedExerciseId]);

    const handleItemSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedExerciseId === 0 || sets < 1 || reps < 1) {
            alert("Wybierz ćwiczenie i podaj poprawne wartości serii/powtórzeń.");
            return;
        }
        const selectedExercise = availableExercises.find(e => e.id === selectedExerciseId);
        const newItem: PlanItem = {
            exerciseId: selectedExerciseId,
            sets: sets,
            repetitions: reps,
        };
        onAddItem(newItem);
        onCancel(); 
    };

    return (
        <div className="form-container" style={{ border: '1px solid #00FF00', padding: '20px', margin: '20px 0' }}>
            <h4>➕ Dodaj Ćwiczenie do Planu</h4>
            <form onSubmit={handleItemSubmit}>
                <label>Ćwiczenie</label>
                <select
                    value={selectedExerciseId}
                    onChange={(e) => setSelectedExerciseId(parseInt(e.target.value))}
                    required
                >
                    {availableExercises.map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.muscleGroup})</option>
                    ))}
                </select>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <div>
                        <label>Serie</label>
                        <input type="number" value={sets} onChange={(e) => setSets(parseInt(e.target.value))} min="1" required />
                    </div>
                    <div>
                        <label>Powtórzenia</label>
                        <input type="number" value={reps} onChange={(e) => setReps(parseInt(e.target.value))} min="1" required />
                    </div>
                    <div>
                        <label>Docelowy Ciężar (kg, opcjonalnie)</label>
                        <input
                            type="number"
                            value={targetWeight || ''}
                            onChange={(e) => setTargetWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                            step="0.5"
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" className="neon-button-mini" disabled={availableExercises.length === 0}>
                        Dodaj Ćwiczenie
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-button">
                        Anuluj
                    </button>
                </div>
            </form>
        </div>
    );
};

interface AddPlanFormProps {
    token: string;
    onPlanAdded: () => void;
    onCancel: () => void;
}

const AddPlanForm: React.FC<AddPlanFormProps> = ({ token, onPlanAdded, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [planItems, setPlanItems] = useState<PlanItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
    const [exercisesLoading, setExercisesLoading] = useState(true);

    useEffect(() => {
        const fetchExercises = async () => {
            setExercisesLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/Exercises`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.ok) {
                    const data: Exercise[] = await response.json();
                    setAvailableExercises(data);
                } else {
                    setAvailableExercises([
                        { id: 1, name: 'Martwy ciąg', muscleGroup: 'Plecy', isCardio: false, userId: null },
                        { id: 2, name: 'Martwy ciąg', muscleGroup: 'Plecy', isCardio: false, userId: null },
                        { id: 3, name: 'Przysiad ze sztangą', muscleGroup: 'Nogi', isCardio: false, userId: null },
                    ]);
                }
            } catch (err) {
                console.error("Błąd sieci.");
            } finally {
                setExercisesLoading(false);
            }
        };
        fetchExercises();
    }, [token]);

    const handleAddItem = (item: PlanItem) => {
        setPlanItems(prev => [...prev, item]);
    };

    const handleRemoveItem = (indexToRemove: number) => {
        setPlanItems(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        if (!name.trim() || planItems.length === 0) {
            setError('Nazwa planu jest wymagana i plan musi mieć ćwiczenia!');
            setLoading(false);
            return;
        }
        const newPlan: NewTrainingPlanDto = {
            name: name.trim(),
            description: description.trim(),
            planItems: planItems,
        };
        try {
            const response = await fetch(`${API_BASE_URL}/TrainingPlans`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPlan),
            });
            if (response.ok) {
                alert(`Plan dodany pomyślnie!`);
                onPlanAdded();
            } else {
                setError(`Błąd: ${response.status}`);
            }
        } catch (err) {
            setError('Błąd sieci.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <button onClick={onCancel} className="back-button">← Anuluj i Wróć</button>
            <h2>✨ Tworzenie Nowego Planu Treningowego</h2>
            <form onSubmit={handleSubmit} className="plan-form">
                <label>Nazwa Planu</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                <label>Główny Cel / Opis Planu</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Np. 'Budowanie masy, nacisk na nogi i plecy.'"
                />
                <h3 style={{ marginTop: '30px' }}>Ćwiczenia w Planie ({planItems.length})</h3>
                {isAddingItem && (
                    <AddPlanItemForm
                        availableExercises={availableExercises}
                        onAddItem={handleAddItem}
                        onCancel={() => setIsAddingItem(false)}
                    />
                )}
                {!isAddingItem && (
                    <button
                        type="button"
                        className="neon-button-mini"
                        onClick={() => setIsAddingItem(true)}
                        disabled={exercisesLoading || availableExercises.length === 0}
                        style={{ marginBottom: '20px' }}
                    >
                        {exercisesLoading ? 'Ładowanie ćwiczeń...' : '+ Dodaj Ćwiczenie do Planu'}
                    </button>
                )}
                <div className="plan-items-list">
                    {planItems.map((item, index) => (
                        <div key={index} className="plan-item-card">
                            <span style={{ fontWeight: 'bold' }}>
                                {item.exerciseName || `ID: ${item.exerciseId}`}
                            </span>
                            <span>{item.sets} x {item.repetitions}</span>
                            {item.targetWeightKg && <span> @ {item.targetWeightKg} kg</span>}
                            <button
                                type="button"
                                className="delete-btn-tiny"
                                onClick={() => handleRemoveItem(index)}
                            >
                                X
                            </button>
                        </div>
                    ))}
                    {planItems.length === 0 && !isAddingItem && (
                        <p style={{ color: '#aaa', fontStyle: 'italic' }}>Plan jest pusty. Dodaj swoje pierwsze ćwiczenie!</p>
                    )}
                </div>
                {error && <p className="error-message">{error}</p>}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" className="neon-button" disabled={loading || !name.trim() || planItems.length === 0}>
                        {loading ? 'Zapisywanie...' : 'Zapisz Plan'}
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-button">
                        Anuluj
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPlanForm;