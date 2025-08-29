import { create } from "zustand";
import axios from "axios";

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
            const response = await axios.post("http://localhost:3605/v1/api/facturas/", facturaInfo);
            set({ facturaData: response.data, isFacturaCreated: true });
            return response.data;
        } catch (error) {
            console.error("Error creating factura:", error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
    
    // Función corregida para obtener facturas detalladas
    getFacturasDetalladas: async () => {
        set({ isLoading: true });
        try {
            // URL CORREGIDA: usa /detailed en lugar de /detalladas
            const response = await axios.get("http://localhost:3605/v1/api/facturas/detailed");
            const facturas = response.data.data || response.data;
            
            // Calcular el monto total
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
        const response = await axios.patch(`http://localhost:3605/v1/api/facturas/${facturaId}/fecha`, {
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
            const response = await axios.get("http://localhost:3605/v1/api/facturas/detailed", {
                params: filtros
            });
            
            const facturasFiltradas = response.data.data || response.data;
            
            set({ 
                facturasFiltradas,
                isLoading: false 
            });
            
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
            const response = await axios.get(`http://localhost:3605/v1/api/facturas/${id}`);
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            console.error("Error obteniendo factura:", error);
            set({ isLoading: false });
            throw error;
        }
    }

    
}));