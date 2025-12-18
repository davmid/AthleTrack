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
        <div className="list-container">
            <button onClick={onBack} className="back-button">← Powrót do Dashboardu</button>
            <h2 style={{ color: '#00FF00' }}>🗓️ Nadchodzące Treningi ({upcomingWorkouts.length})</h2>
            
            {upcomingWorkouts.length === 0 ? (
                <div className="empty-state">
                    <p>Brak zaplanowanych treningów na przyszłość. Czas coś dodać!</p>
                    <button className="neon-button" onClick={onAddWorkout}>Zaplanuj Trening</button>
                </div>
            ) : (
                <div className="upcoming-list">
                    {upcomingWorkouts.map((w) => (
                        <div key={w.id} className="upcoming-card" onClick={() => alert(`Kliknięto: ${w.name} ${w.date}. Tutaj byłaby opcja "Rozpocznij Trening" lub "Edytuj"`)}>
                            <div className="date-badge">{new Date(w.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}</div>
                            <div className="details">
                                <h3>{w.name}</h3>
                                <p>Planowany czas: **{w.durationMinutes} min**</p>
                                <p className="notes-preview">{w.notes || 'Brak notatek.'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpcomingWorkoutsList;