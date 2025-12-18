// konf URL API
export const API_BASE_URL = 'http://localhost:5079/api';

// auth
export interface LoginDto {
    email: string;
    password: string;
}

export interface RegistrationDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface AuthResponse {
    token: string;
    expiration: string;
}

export interface UserDto {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    dateJoined: string;
}

// --- ĆWICZENIA ---
export interface Exercise {
    id: number;
    userId: number | null;
    name: string;
    muscleGroup: string;
    isCardio: boolean;
}

export interface NewExerciseDto {
    name: string;
    muscleGroup: string;
    isCardio: boolean;
    defaultReps?: number;
}

export interface Workout {
    id: number;
    userId: number;
    name: string;
    date: string;
    durationMinutes: number;
    notes?: string;
    workoutSets?: any[];
}

export interface NewWorkoutDto {
    name: string;
    date: string;
    durationMinutes: number;
    notes?: string;
}

export interface WorkoutSet {
    id: number;
    name: string;
    workoutId: number;
    exerciseId: number;
    setNumber: number;
    date: string;
    weightKg: number | null;
    reps: number | null;
    distanceKm: number | null;
    timeSeconds: number | null;
    exercise?: Exercise;
}

export interface NewWorkoutSetDto {
    exerciseId: number;
    name: string;
    setNumber: number;
    date: string;
    weightKg: number | null;
    reps: number | null;
    distanceKm: number | null;
    timeSeconds: number | null;
}

export interface PlanItem {
    id: number;
    trainingPlanId: number;
    exerciseId: number;
    exercise?: Exercise;
    sets: number;
    repetitions: number;
    targetWeightKg?: number;
    targetTimeSeconds?: number;
}

export interface TrainingPlan {
    id: number;
    userId: number;
    name: string;
    description: string;
    planItems: PlanItem[];
}

export interface NewPlanItemDto {
    exerciseId: number;
    sets: number;
    repetitions: number;
    targetWeightKg?: number | null;
    targetTimeSeconds?: number | null;
}

export interface NewTrainingPlanDto {
    name: string;
    description: string;
    planItems: NewPlanItemDto[];
}
