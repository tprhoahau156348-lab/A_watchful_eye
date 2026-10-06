import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

export interface Alert {
    _id: string;
    displayName: string;
    description: string;
    priority: string;
    status: string;
    arena: string;
    lon: number;
    lat: number;
    createdAt?: string;
}


interface AlertStore {
    alerts: Alert[];
    fetchAlertById: (id: string) => Promise<Alert>;
    fetchAlerts: () => Promise<void>;
    addAlert: (alert: Omit<Alert, '_id'>) => Promise<void>;
    updateAlert: (id: string, alert: Omit<Alert, '_id'>) => Promise<void>;
    deleteAlert: (id: string) => Promise<void>;
}

const getAuthHeaders = () => {
    const token = useAuthStore.getState().token;
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const useAlertStore = create<AlertStore>((set) => ({
    alerts: [],
    fetchAlertById: async (id) => {
        const res = await axios.get(`http://localhost:3001/api/alerts/${id}`, getAuthHeaders());
        return res.data;
    },

    fetchAlerts: async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/alerts', getAuthHeaders());
            set({ alerts: res.data });
        } catch (e) {
            console.error(e);
        }
    },
    addAlert: async (alert) => {
        const res = await axios.post('http://localhost:3001/api/alerts', alert, getAuthHeaders());
        set((state) => ({ alerts: [...state.alerts, res.data] }));
    },
    updateAlert: async (id, alert) => {
        const res = await axios.put(`http://localhost:3001/api/alerts/${id}`, alert, getAuthHeaders());
        set((state) => ({
            alerts: state.alerts.map((a) => (a._id === id ? res.data : a)),
        }));
    },
    deleteAlert: async (id) => {
        await axios.delete(`http://localhost:3001/api/alerts/${id}`, getAuthHeaders());
        set((state) => ({
            alerts: state.alerts.filter((a) => a._id !== id),
        }));
    },
}));
