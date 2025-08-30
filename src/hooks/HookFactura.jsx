import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Configuración global de Axios para CORS
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// ✅ Crea una instancia de axios con configuración específica
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// ✅ Interceptor para debug
api.interceptors.request.use(
    (config) => {
        console.log('🔄 Request URL:', config.url);
        console.log('🔄 Request Headers:', config.headers);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ✅ Interceptor para respuestas
api.interceptors.response.use(
    (response) => {
        console.log('✅ Response received:', response.status);
        return response;
    },
    (error) => {
        console.error('❌ Axios Error:', error);
        console.error('❌ Error URL:', error.config?.url);
        console.error('❌ Error Details:', error.response?.data);
        return Promise.reject(error);
    }
);
export const useFacturaStore = create((set, get) => ({

    isLoading: false,
    isFacturaCreated: false,
    setFacturaCreated: (value) => set({ isFacturaCreated: value }),
    facturaData: null,
    setFacturaData: (data) => set({ facturaData: data }),
    
    // Nuevos estados para la lista de facturas
    facturas: [],
    facturasFiltradas: [],
    totalMonto: 0,
    
    // Función existente para crear factura
    createFactura: async (facturaInfo) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/facturas/', facturaInfo); // ✅ Usa 'api' en lugar de 'axios'
            set({ facturaData: response.data, isFacturaCreated: true });
            return response.data;
        } catch (error) {
            console.error("Error creating factura:", error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    getFacturasDetalladas: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/facturas/detailed'); // ✅ Usa 'api'
            const facturas = response.data.data || response.data || [];
            const totalMonto = facturas.reduce((sum, factura) => sum + (factura.monto || 0), 0);
            set({ 
                facturas, 
                facturasFiltradas: facturas,
                totalMonto,
                isLoading: false 
            });
            return facturas;
        } catch (error) {
            console.error("Error obteniendo facturas:", error);
            set({ isLoading: false });
            throw error;
        }
    },

    updateFacturaFecha: async (facturaId, nuevaFecha) => {
    set({ isLoading: true });
    try {
        const response = await api.patch(`/facturas/${facturaId}/fecha`, {
            fecha: nuevaFecha
        });
        
        // Actualizar el estado local con la fecha modificada
        const { facturas, facturasFiltradas } = get();
        
        const updatedFacturas = facturas.map(factura => 
            factura._id === facturaId ? { ...factura, fecha: nuevaFecha } : factura
        );
        
        const updatedFacturasFiltradas = facturasFiltradas.map(factura => 
            factura._id === facturaId ? { ...factura, fecha: nuevaFecha } : factura
        );
        
        set({ 
            facturas: updatedFacturas,
            facturasFiltradas: updatedFacturasFiltradas,
            isLoading: false 
        });
        console.log("Fecha actualizada:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error actualizando fecha:", error);
        set({ isLoading: false });
        throw error;
    }
},
    
    // Función para obtener facturas filtradas
    getFacturasDetalladas: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/facturas/detailed');
            console.log('📦 Response completa:', response);
            console.log('📊 Response data structure:', response.data);
            console.log('🔍 Keys del response:', Object.keys(response.data));
            
            // Diferentes posibles estructuras de respuesta
            let facturas = [];
            
            if (Array.isArray(response.data)) {
                facturas = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
                facturas = response.data.data;
            } else if (response.data.facturas && Array.isArray(response.data.facturas)) {
                facturas = response.data.facturas;
            } else if (response.data.result && Array.isArray(response.data.result)) {
                facturas = response.data.result;
            }
            
            console.log('✅ Facturas extraídas:', facturas);
            
            const totalMonto = facturas.reduce((sum, factura) => sum + (factura.monto || 0), 0);
            set({ 
                facturas, 
                facturasFiltradas: facturas,
                totalMonto,
                isLoading: false 
            });
            
            return facturas;
        } catch (error) {
            console.error("Error obteniendo facturas:", error);
            set({ isLoading: false });
            throw error;
        }
    },
    
    // Función para limpiar filtros y mostrar todas las facturas
    limpiarFiltros: async () => {
        return await get().getFacturasDetalladas();
    },
    
    // Función para obtener una factura específica por ID
    getFacturaById: async (id) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/facturas/${id}`);
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            console.error("Error obteniendo factura:", error);
            set({ isLoading: false });
            throw error;
        }
    }

    
}));