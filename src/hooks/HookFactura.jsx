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
    // Función para obtener facturas filtradas - USANDO EL BACKEND
    getFacturasFiltradas: async (filtros = {}) => {
        set({ isLoading: true });
        try {
            console.log('🔍 Enviando filtros al backend:', filtros);
            
            // Limpiar filtros vacíos
            const filtrosLimpios = {};
            if (filtros.NIT && filtros.NIT.trim() !== '') {
                filtrosLimpios.NIT = filtros.NIT.trim();
            }
            if (filtros.fecha && filtros.fecha.trim() !== '') {
                filtrosLimpios.fecha = filtros.fecha.trim();
            }
            
            console.log('📤 Filtros enviados al backend:', filtrosLimpios);
            
            // Llamar al endpoint DEL BACKEND que SÍ funciona
            const response = await api.get('/facturas/detailed', {
                params: filtrosLimpios
            });
            
            console.log('✅ Respuesta del backend:', response.data);
            
            const facturasFiltradas = response.data.data || [];
            
            console.log('📊 Facturas filtradas recibidas:', facturasFiltradas.length);
            
            set({ 
                facturasFiltradas,
                isLoading: false 
            });
            
            return facturasFiltradas;
            
        } catch (error) {
            console.error("Error filtrando facturas:", error);
            set({ isLoading: false });
            return [];
        }
    },

    // Función específica para filtrar solo por NIT
    filtrarPorNIT: async (nit) => {
        set({ isLoading: true });
        try {
            console.log('🔍 Filtrando por NIT en backend:', nit);
            
            if (!nit || nit.trim() === '') {
                // Si no hay NIT, mostrar todas
                console.log('🔄 Mostrando todas las facturas (NIT vacío)');
                return await get().getFacturasDetalladas();
            }
            
            const nitBuscado = nit.trim();
            console.log('📤 Enviando NIT al backend:', nitBuscado);
            
            // Usar el endpoint del backend que SÍ filtra
            const response = await api.get('/facturas/detailed', {
                params: { NIT: nitBuscado }
            });
            
            const facturasFiltradas = response.data.data || [];
            
            console.log('✅ Filtrado por NIT completado:');
            console.log('📊 Facturas encontradas:', facturasFiltradas.length);
            
            facturasFiltradas.forEach((factura, index) => {
                console.log(`   ${index + 1}. NIT: ${factura.NIT}, Nombre: ${factura.nombreCliente}`);
            });
            
            set({ 
                facturasFiltradas,
                isLoading: false 
            });
            
            return facturasFiltradas;
            
        } catch (error) {
            console.error("Error filtrando por NIT:", error);
            set({ isLoading: false });
            return [];
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