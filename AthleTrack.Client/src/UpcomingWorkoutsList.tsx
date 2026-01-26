import React from 'react';
import { type Workout } from './api';
import { CalendarDays } from 'lucide-react';

interface UpcomingWorkoutsProps {
    workouts: Workout[];
    onBack: () => void;
    onAddWorkout: () => void;
}

const UpcomingWorkoutsList: React.FC<UpcomingWorkoutsProps> = ({ workouts, onBack, onAddWorkout }) => {
    
    const today = new Date().toISOString().substring(0, 10);

    const upcomingWorkouts = workouts
        .filter(w => w.date >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return (
        <div className="list-container">
            <button onClick={onBack} className="back-button">
                ← Powrót do Dashboardu
            </button>
            
            <h2 style={{ color: '#00FF88', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CalendarDays size={28} /> Nadchodzące Treningi ({upcomingWorkouts.length})
            </h2>
            
            {upcomingWorkouts.length === 0 ? (
                <div className="empty-state">
                    <p>Brak zaplanowanych treningów. Czas coś dodać!</p>
                    <button className="neon-button" onClick={onAddWorkout} style={{ width: 'auto', padding: '12px 30px', marginTop: '20px' }}>
                        Zaplanuj Trening
                    </button>
                </div>
            ) : (
                <div className="upcoming-list">
                    {upcomingWorkouts.map((w) => (
                        <div key={w.id} className="upcoming-card history-card clickable-card">
                            <div className="date-badge history-badge">
                                {new Date(w.date).toLocaleDateString('pl-PL', { 
                                    day: 'numeric', 
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </div>

                            <div className="details">
                                <h3>{w.name}</h3>
                                <p>Czas trwania: <strong>{w.durationMinutes || 0} min</strong></p>
                                
                                {typeof w.workoutSets === 'number' && w.workoutSets > 0 && (
                                    <div className="mini-sets-list">
                                        <small>Zaplanowano {w.workoutSets} serii</small>
                                    </div>
                                )}
                                
                                {w.notes && <p className="notes-preview">📝 {w.notes}</p>}
                            </div>
                            
                            <div className="card-action" style={{ marginLeft: 'auto' }}>
                                <span style={{ color: '#00FF88', fontSize: '24px', fontWeight: 'bold' }}>›</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpcomingWorkoutsList;