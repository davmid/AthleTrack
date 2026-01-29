import React from 'react';
import { type Workout } from './api';
import { History } from 'lucide-react';

interface WorkoutsListProps {
    workouts: Workout[];
    onBack: () => void;
}

const WorkoutsList: React.FC<WorkoutsListProps> = ({ workouts, onBack }) => {

    const today = new Date().toISOString().substring(0, 10);

    const pastWorkouts = workouts
        .filter(w => w.date < today)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="list-container">
            <button onClick={onBack} className="back-button">← Powrót do Dashboardu</button>

            <h2 style={{ color: '#007bff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={28} /> Historia Treningów ({pastWorkouts.length})
            </h2>
            {pastWorkouts.length === 0 ? (
                <div className="empty-state">
                    <p>Nie masz jeszcze żadnych zakończonych treningów w historii.</p>
                </div>
            ) : (
                <div className="upcoming-list">
                    {pastWorkouts.map((w) => (
                        <div key={w.id} className="upcoming-card history-card">
                            <div className="date-badge history-badge">
                                {new Date(w.date).toLocaleDateString('pl-PL', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </div>
                            <div className="details">
                                <h3>{w.name}</h3>
                                <p>Czas trwania: <strong>{w.durationMinutes} min</strong></p>
                                {w.notes && <p className="notes-preview">📝 {w.notes}</p>}

                                {typeof w.workoutSets === 'number' && w.workoutSets > 0 && (
                                    <div className="mini-sets-list">
                                        <small>Wykonano {w.workoutSets} serii</small>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkoutsList;