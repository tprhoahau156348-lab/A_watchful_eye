import { create } from 'zustand';
import axios from 'axios';

export interface Alert {
    _id: string;
    displayName: string;
    description: string;
    priority: string;
    status: string;
    arena: string;
    lon: number;
    lat: number;
}

interface AlertStore {
    alerts: Alert[];
    fetchAlertById: (id: string) => Promise<Alert>;
    fetchAlerts: () => Promise<void>;
    addAlert: (alert: Omit<Alert, '_id'>) => Promise<void>;
    updateAlert: (id: string, alert: Omit<Alert, '_id'>) => Promise<void>;
    deleteAlert: (id: string) => Promise<void>;
}

export const useAlertStore = create<AlertStore>((set) => ({
    alerts: [],
    fetchAlertById: async (id) => {
        const res = await axios.get(`http://localhost:3001/api/alerts/${id}`);
        return res.data;
    },
    fetchAlerts: async () => {
        const res = await axios.get(`http://localhost:3001/api/alerts`);
        set({ alerts: res.data });
    },
    addAlert: async (alert) => {
        const res = await axios.post(`http://localhost:3001/api/alerts`, alert);
        set((state) => ({ alerts: [...state.alerts, res.data] }));
    },
    updateAlert: async (id, alert) => {
        const res = await axios.put(`http://localhost:3001/api/alerts/${id}`, alert);
        set((state) => ({
            alerts: state.alerts.map((a) => (a._id === id ? res.data : a)),
        }));
    },
    deleteAlert: async (id) => {
        await axios.delete(`http://localhost:3001/api/alerts/${id}`);
        set((state) => ({
            alerts: state.alerts.filter((a) => a._id !== id),
        }));
    },
}));
