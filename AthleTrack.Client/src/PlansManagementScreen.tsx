import React, { useState, useEffect } from 'react';
import { API_BASE_URL, type TrainingPlan } from './api';

interface PlansProps {
    token: string;
    onAddPlan: () => void;
}

const PlansManagementScreen: React.FC<PlansProps> = ({ token, onAddPlan }) => {
    const [plans, setPlans] = useState<TrainingPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/TrainingPlans`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setPlans(await res.json());
            } catch (err) {
                console.error("Błąd pobierania planów");
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, [token]);

    return (
        <div className="plans-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="content-header">Twoje Plany</h1>
                <button className="neon-button-mini" onClick={onAddPlan}>+ Nowy Plan</button>
            </div>

            {loading ? <p>Ładowanie...</p> : (
                <div className="plans-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '20px',
                    marginTop: '20px' 
                }}>
                    {plans.map(plan => (
                        <div key={plan.id} className="plan-card neon-border" style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                            <h3>{plan.name}</h3>
                            <p style={{ color: '#888', minHeight: '40px' }}>{plan.description}</p>
                            <div style={{ fontSize: '0.8rem', color: '#00FF00' }}>
                                Ćwiczeń: {plan.planItems?.length || 0}
                            </div>
                            <button className="start-workout-button" style={{ marginTop: '15px', padding: '10px' }}>
                                Rozpocznij z tym planem
                            </button>
                        </div>
                    ))}
                    {plans.length === 0 && <p>Brak planów. Dodaj swój pierwszy plan!</p>}
                </div>
            )}
        </div>
    );
};

export default PlansManagementScreen;