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

export interface WorkoutSetDto {
    id?: number;
    exerciseId: number;
    setNumber: number;
    weightKg: number | null;
    reps: number | null;
    distanceKm?: number | null;
    timeSeconds?: number | null;
    exercise?: {
        name: string;
        category?: string;
    };
}

export interface Workout {
    id: number;
    name: string;
    date: string;
    notes?: string;
    workoutSets: WorkoutSetDto[];
}

export interface NewWorkoutDto {
    name: string;
    date: string;
    notes?: string | null;
    workoutSets: WorkoutSetDto[];
}

export interface BodyMetric {
    measurementDate?: string;
    weightKg: number | null;
    bodyFatPercent: number | null;
    waistCm: number | null;
    chestCm: number | null;
    bicepsCm: number | null;
    notes?: string;
}

export interface NewBodyMetricDto {
    measurementDate?: string;
    weightKg: number | null;
    bodyFatPercent: number | null;
    waistCm: number | null;
    chestCm: number | null;
    bicepsCm: number | null;
    notes?: string;
}

export interface PersonalRecordDto {
    exerciseName: string;
    maxWeight: number;
    maxReps: number;
    maxDistanceKm?: number | null;
    date: string;
    isCardio: boolean;
    estimatedOneRepMax?: number | null;
}