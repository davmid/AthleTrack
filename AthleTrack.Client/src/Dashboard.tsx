import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL, type UserDto, type Workout, type BodyMetric } from './api';
import {
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import UpcomingWorkoutsList from './UpcomingWorkoutsList';
import ExerciseManagementScreen from './ExerciseManagementScreen';
import PersonalRecords from './PersonalRecords';
import AddWorkoutForm from './AddWorkoutForm';
import WorkoutsList from './WorkoutsList';
import UserProfile from './UserProfile';

import {
    Activity, Calendar, Dumbbell, Flame, Hand,
    History, Home, LogOut, Play, Trophy, User, Weight, Map
} from 'lucide-react';

type View = 'dashboard' | 'addWorkout' | 'viewWorkouts' | 'viewSchedule' | 'manageExercises' | 'personalRecords' | 'profile';

interface DashboardProps {
    token: string;
    onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardProps> = ({ token, onLogout }) => {
    const [user, setUser] = useState<UserDto | null>(null);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<View>('dashboard');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [userRes, workoutsRes, metricsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/Auth/me`, { headers }),
                fetch(`${API_BASE_URL}/Workouts`, { headers }),
                fetch(`${API_BASE_URL}/BodyMetrics`, { headers })
            ]);

            if (userRes.status === 401) { onLogout(); return; }

            if (userRes.ok) setUser(await userRes.json());
            if (workoutsRes.ok) setWorkouts(await workoutsRes.json());
            if (metricsRes.ok) setBodyMetrics(await metricsRes.json());
        } catch (err) {
            setError("Błąd połączenia z serwerem.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [token]);

    const workoutsThisWeek = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return workouts.filter(w => w.date && new Date(w.date) >= oneWeekAgo).length;
    }, [workouts]);

    const latestMetric = useMemo(() => {
        if (!bodyMetrics || bodyMetrics.length === 0) return null;
        return [...bodyMetrics].sort((a, b) =>
            new Date(b.measurementDate ?? 0).getTime() - new Date(a.measurementDate ?? 0).getTime()
        )[0];
    }, [bodyMetrics]);

    const weightChartData = useMemo(() => {
        if (!bodyMetrics.length) return [];
        return bodyMetrics
            .filter(m => m.measurementDate && m.weightKg !== null)
            .sort((a, b) => new Date(a.measurementDate!).getTime() - new Date(b.measurementDate!).getTime())
            .map(m => ({
                date: new Date(m.measurementDate!).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }),
                weight: m.weightKg,
            }));
    }, [bodyMetrics]);

    const workoutChartData = useMemo(() => {
        if (!workouts.length) return [];
        return workouts
            .filter(w => new Date(w.date) <= new Date())
            .sort((a, b) => new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime())
            .slice(-10)
            .map(w => {
                const strengthSets = w.workoutSets?.filter(s => (s.weightKg || 0) > 0) || [];
                const avgWeight = strengthSets.length > 0
                    ? strengthSets.reduce((sum, s) => sum + (s.weightKg || 0), 0) / strengthSets.length
                    : 0;

                return {
                    name: w.date ? new Date(w.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }) : '?',
                    avgWeight: Math.round(avgWeight * 10) / 10,
                };
            }).filter(d => d.avgWeight > 0);
    }, [workouts]);

    const cardioChartData = useMemo(() => {
        if (!workouts.length) return [];
        return workouts
            .filter(w => new Date(w.date) <= new Date())
            .sort((a, b) => new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime())
            .slice(-10)
            .map(w => {
                const totalDistance = w.workoutSets?.reduce((sum, s) => sum + (s.distanceKm || 0), 0) || 0;
                return {
                    name: w.date ? new Date(w.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }) : '?',
                    distance: Math.round(totalDistance * 100) / 100,
                };
            }).filter(d => d.distance > 0);
    }, [workouts]);

    const heatmapValues = useMemo(() => {
        return workouts.map(w => ({
            date: w.date ? w.date.split('T')[0] : '',
            count: 1
        })).filter(v => v.date !== '');
    }, [workouts]);


    const handleUpdateWorkout = async (updatedWorkout: Workout) => {
        try {
            const response = await fetch(`${API_BASE_URL}/Workouts/${updatedWorkout.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedWorkout)
            });
            if (response.ok) await fetchData();
        } catch (err) { console.error(err); }
    };

    const handleDeleteWorkout = async (id: number) => {
        if (!window.confirm("Czy na pewno chcesz usunąć ten trening?")) return;
        try {
            const response = await fetch(`${API_BASE_URL}/Workouts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) await fetchData();
        } catch (err) { console.error(err); }
    };

    const renderMainContent = () => {
        if (loading) return <div className="loading-screen">Ładowanie danych...</div>;
        if (error) return <div className="error-screen">{error}</div>;

        switch (currentView) {
            case 'profile': return <UserProfile token={token} user={user} onUpdate={fetchData} />;
            case 'addWorkout': return <AddWorkoutForm token={token} onWorkoutAdded={() => { setCurrentView('dashboard'); fetchData(); }} onCancel={() => setCurrentView('dashboard')} />;
            case 'viewWorkouts': return <WorkoutsList workouts={workouts} onBack={() => setCurrentView('dashboard')} onUpdateWorkout={handleUpdateWorkout} onDeleteWorkout={handleDeleteWorkout} />;
            case 'viewSchedule': return <UpcomingWorkoutsList workouts={workouts} onBack={() => setCurrentView('dashboard')} onAddWorkout={() => setCurrentView('addWorkout')} onUpdateWorkout={handleUpdateWorkout} onDeleteWorkout={handleDeleteWorkout} />;
            case 'manageExercises': return <ExerciseManagementScreen token={token} onBack={() => setCurrentView('dashboard')} />;
            case 'personalRecords': return <PersonalRecords token={token} onBack={() => setCurrentView('dashboard')} />;
            case 'dashboard':
            default:
                return (
                    <div className="fade-in">
                        <header className="dashboard-header">
                            <div className="welcome-container">
                                <h1>Witaj, {user?.firstName}!</h1>
                                <div className="stat-icon-wrapper" style={{ color: '#00FF88' }}><Hand size={44} /></div>
                            </div>
                            <button className="start-workout-button" onClick={() => setCurrentView('addWorkout')}>
                                <Play size={18} fill="currentColor" /> ZACZNIJ TRENING
                            </button>
                        </header>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon-wrapper" style={{ color: '#00FF88' }}><Flame size={26} /></div>
                                <h3 className="stat-value">{workoutsThisWeek}</h3>
                                <p className="stat-label">Treningi (7 dni)</p>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper" style={{ color: '#00d4ff' }}><Weight size={26} /></div>
                                <h3 className="stat-value">{latestMetric?.weightKg ?? '--'} kg</h3>
                                <p className="stat-label">Ostatnia Waga</p>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper" style={{ color: '#a155ff' }}><Activity size={26} /></div>
                                <h3 className="stat-value">{latestMetric?.bodyFatPercent ?? '--'}%</h3>
                                <p className="stat-label">Tkanka Tłuszczowa</p>
                            </div>
                        </div>

                        <div className="visualization-section">
                            <div className="chart-container">
                                <h3>Trend Masy Ciała</h3>
                                <div style={{ width: '100%', height: 280 }}>
                                    {weightChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={weightChartData}>
                                                <defs>
                                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                                <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 12 }} />
                                                <YAxis stroke="#888" domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 12 }} unit="kg" />
                                                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                                                <Area type="monotone" dataKey="weight" stroke="#00d4ff" fillOpacity={1} fill="url(#colorWeight)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : <div className="no-data-msg">Brak danych o wadze.</div>}
                                </div>
                            </div>

                            <div className="chart-container">
                                <h3>Średni Ciężar Serii (kg)</h3>
                                <div style={{ width: '100%', height: 280 }}>
                                    {workoutChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={workoutChartData}>
                                                <defs>
                                                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#00FF88" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                                <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 12 }} />
                                                <YAxis stroke="#888" tick={{ fontSize: 12 }} unit="kg" />
                                                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                                                <Area type="monotone" dataKey="avgWeight" stroke="#00FF88" fillOpacity={1} fill="url(#colorAvg)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : <div className="no-data-msg">Brak danych siłowych.</div>}
                                </div>
                            </div>

                            <div className="chart-container" style={{ gridColumn: '1 / -1' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <Map size={20} color="#ffaa00" />
                                    <h3 style={{ margin: 0 }}>Dystans Biegowy (km)</h3>
                                </div>
                                <div style={{ width: '100%', height: 280 }}>
                                    {cardioChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={cardioChartData}>
                                                <defs>
                                                    <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ffaa00" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#ffaa00" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                                <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 12 }} />
                                                <YAxis stroke="#888" tick={{ fontSize: 12 }} unit="km" />
                                                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                                                <Area type="monotone" dataKey="distance" stroke="#ffaa00" fillOpacity={1} fill="url(#colorDist)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : <div className="no-data-msg">Dodaj treningi cardio, aby zobaczyć statystyki dystansu.</div>}
                                </div>
                            </div>

                            <div className="heatmap-container" style={{ gridColumn: '1 / -1' }}>
                                <h3>Systematyczność (Ostatni rok)</h3>
                                <div className="heatmap-wrapper">
                                    <CalendarHeatmap
                                        startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                                        endDate={new Date()}
                                        values={heatmapValues}
                                        classForValue={(value) => !value ? 'color-empty' : 'color-scale-active'}
                                    />
                                </div>
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
                        <li onClick={() => setCurrentView('dashboard')} className={currentView === 'dashboard' ? 'active' : ''}>
                            <Home size={20} /> Home
                        </li>
                        <li onClick={() => setCurrentView('viewWorkouts')} className={currentView === 'viewWorkouts' ? 'active' : ''}>
                            <History size={20} /> Historia
                        </li>
                        <li onClick={() => setCurrentView('viewSchedule')} className={currentView === 'viewSchedule' ? 'active' : ''}>
                            <Calendar size={20} /> Planer
                        </li>
                        <li onClick={() => setCurrentView('manageExercises')} className={currentView === 'manageExercises' ? 'active' : ''}>
                            <Dumbbell size={20} /> Ćwiczenia
                        </li>
                        <li onClick={() => setCurrentView('personalRecords')} className={currentView === 'personalRecords' ? 'active' : ''}>
                            <Trophy size={20} /> Rekordy
                        </li>
                    </ul>
                </div>
                <div className="nav-bottom">
                    <div className="user-profile-item" onClick={() => setCurrentView('profile')}>
                        <div className="avatar"><User size={20} color="#000" /></div>
                        <div className="user-details">
                            <span className="user-name">{user?.firstName} {user?.lastName}</span>
                        </div>
                    </div>
                    <button className="logout-button" onClick={onLogout}>
                        <LogOut size={18} /> Wyloguj
                    </button>
                </div>
            </nav>
            <main className="dashboard-content">
                {renderMainContent()}
            </main>
        </div>
    );
};

export default DashboardScreen;