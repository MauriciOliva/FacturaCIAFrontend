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
        const response = await axios.patch(`${API_BASE_URL}/facturas/${facturaId}/fecha`, {
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
    getFacturasFiltradas: async (filtros = {}) => {
        set({ isLoading: true });
        try {
            // Llamar al endpoint con los filtros como query parameters
            const response = await axios.get(`${API_BASE_URL}/facturas/detailed`, {
                params: filtros
            });
            
            const facturasFiltradas = response.data.data || response.data;
            
            set({ 
                facturasFiltradas,
                isLoading: false 
            });
            console.log("Facturas filtradas:", facturasFiltradas);
            return facturasFiltradas;
        } catch (error) {
            console.error("Error filtrando facturas:", error);
            
            // Fallback: si el endpoint no existe, filtrar manualmente
            const { facturas } = get();
            let facturasFiltradasManual = [...facturas];
            
            if (filtros.NIT) {
                facturasFiltradasManual = facturasFiltradasManual.filter(factura => 
                    factura.NIT && factura.NIT.includes(filtros.NIT)
                );
            }
            
            if (filtros.fecha) {
                const fechaFiltro = new Date(filtros.fecha);
                facturasFiltradasManual = facturasFiltradasManual.filter(factura => {
                    if (!factura.fecha) return false;
                    const fechaFactura = new Date(factura.fecha);
                    return fechaFactura.toDateString() === fechaFiltro.toDateString();
                });
            }
            
            set({ 
                facturasFiltradas: facturasFiltradasManual,
                isLoading: false 
            });
            
            return facturasFiltradasManual;
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
            const response = await axios.get(`${API_BASE_URL}/facturas/${id}`);
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            console.error("Error obteniendo factura:", error);
            set({ isLoading: false });
            throw error;
        }
    }

    
}));