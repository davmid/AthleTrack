import React from 'react';
import { type Workout } from './api';

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
        <div className="list-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <button onClick={onBack} className="back-button" style={{ marginBottom: '20px' }}>
                ← Powrót do Dashboardu
            </button>
            
            <h2 style={{ color: '#00FF88', marginBottom: '25px' }}>
                🗓️ Nadchodzące Treningi ({upcomingWorkouts.length})
            </h2>
            
            {upcomingWorkouts.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '50px' }}>
                    <p style={{ color: '#666', marginBottom: '20px' }}>Brak zaplanowanych treningów. Czas coś dodać!</p>
                    <button className="neon-button" onClick={onAddWorkout} style={{ width: 'auto', padding: '12px 30px' }}>
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
                                    month: 'short' 
                                })}
                                <div style={{ fontSize: '10px', color: '#555', marginTop: '4px' }}>
                                    {new Date(w.date).getFullYear()}
                                </div>
                            </div>

                            <div className="details">
                                <h3>{w.name}</h3>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <p>⏱ <strong>{w.durationMinutes || 0} min</strong></p>
                                    {typeof w.workoutSets === 'number' && w.workoutSets > 0 && (
                                        <p style={{ color: '#00FF88' }}>⚡ <strong>{w.workoutSets} serii</strong></p>
                                    )}
                                </div>
                                {w.notes && <p className="notes-preview">📝 {w.notes}</p>}
                            </div>
                            
                            <div className="card-action">
                                <span style={{ color: '#00FF88', fontSize: '20px' }}>›</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpcomingWorkoutsList;