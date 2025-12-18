import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL, type UserDto, type Workout } from './api';
import UpcomingWorkoutsList from './UpcomingWorkoutsList';
import AddPlanForm from './AddPlanForm';
import ExerciseManagementScreen from './ExerciseManagementScreen';
import AddWorkoutForm from './AddWorkoutForm';
import WorkoutsList from './WorkoutsList';

type View = 'dashboard' | 'addWorkout' | 'viewWorkouts' | 'viewPlans' | 'viewSchedule' | 'createNewPlan' | 'manageExercises';

interface DashboardProps {
    token: string;
    onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardProps> = ({ token, onLogout }) => {
    const [user, setUser] = useState<UserDto | null>(null);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<View>('dashboard');

    const weeklyVolume = useMemo(() => workouts.length * 500, [workouts]);
    const workoutsThisWeek = useMemo(() => {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
        return workouts.filter(w => w.date >= oneWeekAgo && w.date <= new Date().toISOString().substring(0, 10)).length;
    }, [workouts]);

    const fetchUserDataAndWorkouts = async () => {
        setLoading(true);
        setError(null);
        try {
            const [userRes, workoutsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/Auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/Workouts`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (userRes.status === 401) {
                onLogout();
                return;
            }

            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData);
            }

            if (workoutsRes.ok) {
                const workoutsData = await workoutsRes.json();
                setWorkouts(workoutsData);
            }

            if (!userRes.ok && !workoutsRes.ok) {
                setError("Błąd podczas komunikacji z serwerem.");
            }
        } catch (err) {
            setError("Błąd sieci. Sprawdź połączenie z API.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDataAndWorkouts();
    }, [token]);

    const renderMainContent = () => {
        if (loading) return <div className="loading-screen">Ładowanie...</div>;
        if (error) return <div className="error-screen">Błąd: {error}</div>;

        switch (currentView) {
            case 'addWorkout':
                return <AddWorkoutForm token={token} onWorkoutAdded={() => { setCurrentView('dashboard'); fetchUserDataAndWorkouts(); }} onCancel={() => setCurrentView('dashboard')} />;

        case 'viewWorkouts':
            return <WorkoutsList workouts={workouts} onBack={() => setCurrentView('dashboard')} />;

            case 'viewSchedule':
                return <UpcomingWorkoutsList workouts={workouts} onBack={() => setCurrentView('dashboard')} onAddWorkout={() => setCurrentView('addWorkout')} />;

            case 'createNewPlan':
                return <AddPlanForm token={token} onPlanAdded={() => { setCurrentView('dashboard'); fetchUserDataAndWorkouts(); }} onCancel={() => setCurrentView('dashboard')} />;

            case 'manageExercises':
                return <ExerciseManagementScreen token={token} onBack={() => setCurrentView('dashboard')} />;

            case 'dashboard':
            default:
                return (
                    <>
                        <h1 className="content-header">Witaj, {user?.firstName}!</h1>
                        <button className="start-workout-button" onClick={() => setCurrentView('addWorkout')}>
                            ▶ NOWY TRENING
                        </button>

                        <h2 style={{ color: '#ccc', marginTop: '30px' }}>Przegląd Tygodnia</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3 className="stat-value">{workoutsThisWeek}</h3>
                                <p className="stat-label">Treningi (7 dni)</p>
                            </div>
                            <div className="stat-card">
                                <h3 className="stat-value">{weeklyVolume.toLocaleString()} kg</h3>
                                <p className="stat-label">Objętość</p>
                            </div>
                            <div className="stat-card">
                                <h3 className="stat-value">🔥</h3>
                                <p className="stat-label">Aktywny tydzień</p>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="dashboard-layout">
            <nav className="dashboard-nav">
                <div className="logo" style={{ marginBottom: '40px' }}>AthleTrack</div>
                <ul className="nav-list">
                    <li onClick={() => setCurrentView('dashboard')} className={currentView === 'dashboard' ? 'active' : ''}>🏠 Home</li>
                    <li onClick={() => setCurrentView('viewWorkouts')} className={currentView === 'viewWorkouts' ? 'active' : ''}>🏋️ Historia</li>
                    <li onClick={() => setCurrentView('viewSchedule')} className={currentView === 'viewSchedule' ? 'active' : ''}>🗓️ Planer</li>
                    <li onClick={() => setCurrentView('manageExercises')} className={currentView === 'manageExercises' ? 'active' : ''}>💪 Ćwiczenia</li>
                </ul>
                <button className="logout-button" onClick={onLogout}>Wyloguj</button>
            </nav>

            <main className="dashboard-content">
                {renderMainContent()}
            </main>
        </div>
    );
};

export default DashboardScreen;