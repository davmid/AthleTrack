import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL, type UserDto, type Workout } from './api';
import UpcomingWorkoutsList from './UpcomingWorkoutsList';
import AddPlanForm from './AddPlanForm';
import ExerciseManagementScreen from './ExerciseManagementScreen';
import AddWorkoutForm from './AddWorkoutForm';
import WorkoutsList from './WorkoutsList';
import UserProfile from './UserProfile';

type View = 'dashboard' | 'addWorkout' | 'viewWorkouts' | 'viewSchedule' | 'createNewPlan' | 'manageExercises' | 'profile';

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

    const workoutsThisWeek = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return workouts.filter(w => new Date(w.date) >= oneWeekAgo).length;
    }, [workouts]);

    const totalWeightThisWeek = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return workouts
            .filter(w => new Date(w.date) >= oneWeekAgo && w.weightKg)
            .reduce((sum, w) => sum + (w.weightKg || 0), 0);
    }, [workouts]);

    const fetchUserDataAndWorkouts = async () => {
        setLoading(true);
        try {
            const [userRes, workoutsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/Auth/me`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/Workouts`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (userRes.status === 401) { onLogout(); return; }

            if (userRes.ok) setUser(await userRes.json());
            if (workoutsRes.ok) setWorkouts(await workoutsRes.json());

        } catch (err) {
            setError("Błąd połączenia z serwerem.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDataAndWorkouts();
    }, [token]);

    const renderMainContent = () => {
        if (loading) return <div className="loading-screen">Ładowanie...</div>;
        if (error) return <div className="error-screen">{error}</div>;

        switch (currentView) {
            case 'profile':
                return <UserProfile token={token} user={user} />;
            case 'addWorkout':
                return <AddWorkoutForm token={token} onWorkoutAdded={() => { setCurrentView('dashboard'); fetchUserDataAndWorkouts(); }} onCancel={() => setCurrentView('dashboard')} />;
            case 'viewWorkouts':
                return <WorkoutsList workouts={workouts} onBack={() => setCurrentView('dashboard')} />;
            case 'viewSchedule':
                return <UpcomingWorkoutsList workouts={workouts} onBack={() => setCurrentView('dashboard')} onAddWorkout={() => setCurrentView('addWorkout')} />;
            case 'manageExercises':
                return <ExerciseManagementScreen token={token} onBack={() => setCurrentView('dashboard')} />;
            case 'dashboard':
            default:
                return (
                    <div className="fade-in">
                        <header className="dashboard-header">
                            <div>
                                <h1>Witaj, {user?.firstName}! 👋</h1>
                                <p>Twój dzisiejszy plan to solidny trening.</p>
                            </div>
                            <button className="start-workout-button" onClick={() => setCurrentView('addWorkout')}>
                                ▶ ZACZNIJ TRENING
                            </button>
                        </header>

                        <div className="stats-grid">
                            <div className="stat-card highlight">
                                <h3 className="stat-value">{workoutsThisWeek}</h3>
                                <p className="stat-label">Treningi (7 dni)</p>
                            </div>
                            <div className="stat-card">
                                <h3 className="stat-value">{totalWeightThisWeek.toLocaleString()} kg</h3>
                                <p className="stat-label">Podniesiony ciężar</p>
                            </div>
                            <div className="stat-card">
                                <h3 className="stat-value">Rank</h3>
                                <p className="stat-label">Wojownik</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-layout">
            <nav className="dashboard-nav">
                <div className="nav-top">
                    <div className="logo">ATHLE<span>TRACK</span></div>
                    <ul className="nav-list">
                        <li onClick={() => setCurrentView('dashboard')} className={currentView === 'dashboard' ? 'active' : ''}>🏠 Home</li>
                        <li onClick={() => setCurrentView('viewWorkouts')} className={currentView === 'viewWorkouts' ? 'active' : ''}>🏋️ Historia</li>
                        <li onClick={() => setCurrentView('viewSchedule')} className={currentView === 'viewSchedule' ? 'active' : ''}>🗓️ Planer</li>
                        <li onClick={() => setCurrentView('manageExercises')} className={currentView === 'manageExercises' ? 'active' : ''}>💪 Ćwiczenia</li>
                    </ul>
                </div>
                
                <div className="nav-bottom">
                    <div className={`user-profile-item ${currentView === 'profile' ? 'active' : ''}`} onClick={() => setCurrentView('profile')}>
                        <div className="avatar">{user?.firstName?.[0]}</div>
                        <div className="user-details">
                            <span className="user-name">{user?.firstName} {user?.lastName}</span>
                            <span className="user-meta"> Mój Profil</span>
                        </div>
                    </div>
                    <button className="logout-button" onClick={onLogout}>🚪 Wyloguj się</button>
                </div>
            </nav>

            <main className="dashboard-content">
                {renderMainContent()}
            </main>
        </div>
    );
};

export default DashboardScreen;