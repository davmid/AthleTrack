import React, { useState } from 'react';
import { type Workout, type WorkoutSetDto } from './api'; 
import { History, Dumbbell, Map, ChevronLeft, ChevronDown, ChevronUp, Edit2, Save, X, Trash2, Clock } from 'lucide-react';

interface WorkoutsListProps {
    workouts: Workout[];
    onBack: () => void;
    onUpdateWorkout: (workout: Workout) => Promise<void>;
    onDeleteWorkout: (id: number) => Promise<void>;
}

const WorkoutsList: React.FC<WorkoutsListProps> = ({ workouts, onBack, onUpdateWorkout, onDeleteWorkout }) => {
    const [expandedWorkoutId, setExpandedWorkoutId] = useState<number | null>(null);
    const [editModeId, setEditModeId] = useState<number | null>(null);
    const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

    const cancelEdit = () => {
        setEditModeId(null);
        setEditingWorkout(null);
    };

    const pastWorkouts = [...workouts]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const toggleDetails = (id: number) => {
        if (editModeId !== id) {
            setExpandedWorkoutId(expandedWorkoutId === id ? null : id);
        }
    };

    const startEdit = (workout: Workout) => {
        setEditModeId(workout.id);
        setEditingWorkout(JSON.parse(JSON.stringify(workout))); 
    };

    const handleSetChange = (setIndex: number, field: keyof WorkoutSetDto, value: any) => {
        if (!editingWorkout) return;
        const updatedSets = [...editingWorkout.workoutSets];
        updatedSets[setIndex] = { ...updatedSets[setIndex], [field]: value };
        setEditingWorkout({ ...editingWorkout, workoutSets: updatedSets });
    };

    const saveChanges = async () => {
        if (!editingWorkout) return;
        await onUpdateWorkout(editingWorkout);
        setEditModeId(null);
        setEditingWorkout(null);
    };

    return (
        <div className="list-container">
            <button onClick={onBack} className="back-button"><ChevronLeft size={18} /> Powrót do Dashboard</button>
            <h2 className="history-header"><History size={28} color="#00FF88" style={{marginRight: '10px'}}/>Historia</h2>

            <div className="history-grid">
                {pastWorkouts.map((w) => {
                    const isExpanded = expandedWorkoutId === w.id;
                    const isEditing = editModeId === w.id;
                    const currentWorkout = isEditing ? editingWorkout! : w;

                    return (
                        <div key={w.id} className={`workout-history-card ${isExpanded ? 'expanded' : ''}`}>
                            <div className="workout-header" onClick={() => toggleDetails(w.id)} style={{ cursor: 'pointer' }}>
                                <span className="workout-date">{new Date(w.date).toLocaleDateString()}</span>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 className="workout-title">{w.name}</h3>
                                    {isExpanded ? <ChevronUp size={20} color="#00FF88" /> : <ChevronDown size={20} color="#666" />}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="sets-detail-list" style={{ marginTop: '15px', borderTop: '1px solid #222', paddingTop: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                                        <h4 style={{ color: '#00FF88', fontSize: '11px', textTransform: 'uppercase', margin: 0 }}>Przebieg sesji</h4>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {!isEditing ? (
                                                <>
                                                    <button onClick={() => startEdit(w)} className="refresh-button"><Edit2 size={12}/> Edytuj</button>
                                                    <button onClick={() => onDeleteWorkout(w.id)} className="refresh-button" style={{color: '#ff4444', borderColor: '#442222'}}><Trash2 size={12}/></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={saveChanges} className="refresh-button" style={{color: '#00FF88'}}><Save size={12}/> Zapisz</button>
                                                    <button onClick={cancelEdit} className="refresh-button" style={{color: '#ff4444'}}><X size={12}/> Anuluj</button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {currentWorkout.workoutSets.map((set, idx) => {
                                        const isCardio = set.distanceKm !== null && (set.weightKg === null || set.weightKg === 0);

                                        return (
                                            <div key={idx} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'center' }}>
                                                <span style={{ flex: 2, fontSize: '14px', color: '#eee' }}>
                                                    {set.exercise?.name || 'Ćwiczenie'} 
                                                </span>
                                                
                                                {isEditing ? (
                                                    <div style={{ display: 'flex', gap: '6px', flex: 2, justifyContent: 'flex-end' }}>
                                                        {isCardio ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <input 
                                                                    type="number" 
                                                                    placeholder="km"
                                                                    value={set.distanceKm ?? ''} 
                                                                    onChange={(e) => handleSetChange(idx, 'distanceKm', e.target.value === '' ? null : parseFloat(e.target.value))} 
                                                                    style={{ width: '70px', background: '#000', border: '1px solid #333', color: '#00d4ff', padding: '4px', textAlign: 'center', borderRadius: '4px' }}
                                                                />
                                                                <span style={{fontSize: '10px', color: '#555'}}>km</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <input 
                                                                    type="number" 
                                                                    value={set.weightKg ?? ''} 
                                                                    onChange={(e) => handleSetChange(idx, 'weightKg', e.target.value === '' ? null : parseFloat(e.target.value))} 
                                                                    style={{ width: '60px', background: '#000', border: '1px solid #333', color: '#00FF88', padding: '4px', textAlign: 'center', borderRadius: '4px' }}
                                                                />
                                                                <input 
                                                                    type="number" 
                                                                    value={set.reps ?? ''} 
                                                                    onChange={(e) => handleSetChange(idx, 'reps', e.target.value === '' ? null : parseInt(e.target.value))} 
                                                                    style={{ width: '50px', background: '#000', border: '1px solid #333', color: '#00FF88', padding: '4px', textAlign: 'center', borderRadius: '4px' }}
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ flex: 1, textAlign: 'right', color: isCardio ? '#00d4ff' : '#00FF88', fontWeight: '600' }}>
                                                        {isCardio 
                                                            ? `${set.distanceKm} km` 
                                                            : `${set.weightKg}kg x ${set.reps}`}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WorkoutsList;