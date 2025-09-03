import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const usePagoStore = create((set, get) => ({
    pagos: [],
    isLoading: false,
    error: null,

    // Obtener todos los pagos
    getPagos: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_BASE_URL}/pagos/`);
            const pagos = response.data.data || response.data || [];
            set({ pagos, isLoading: false });
            return pagos;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Crear un nuevo pago
    createPago: async (pagoInfo) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_BASE_URL}/pagos/`, pagoInfo);
            // Actualizar lista de pagos local
            const pagos = [...get().pagos, response.data.data];
            set({ pagos, isLoading: false });
            return response.data.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Limpiar errores
    clearError: () => set({ error: null })
}));
