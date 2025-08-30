import { create } from "zustand";
import axios from "axios";

let baseURL = import.meta.env.VITE_API_BASE_URL || "";

// 🛠️ Normalizar: quitar "/" al final si existe
if (baseURL.endsWith("/")) {
  baseURL = baseURL.slice(0, -1);
}

// ✅ Crea una instancia de axios con configuración segura
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ Interceptor para debug
api.interceptors.request.use(
  (config) => {
    console.log("🔄 Request URL:", `${config.baseURL}${config.url}`);
    console.log("🔄 Request Headers:", config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log("✅ Response received:", response.status);
    return response;
  },
  (error) => {
    console.error("❌ Axios Error:", error);
    console.error("❌ Error URL:", error.config?.url);
    console.error("❌ Error Details:", error.response?.data);
    return Promise.reject(error);
  }
);

export const useFacturaStore = create((set, get) => ({
  isLoading: false,
  isFacturaCreated: false,
  setFacturaCreated: (value) => set({ isFacturaCreated: value }),
  facturaData: null,
  setFacturaData: (data) => set({ facturaData: data }),

  facturas: [],
  facturasFiltradas: [],
  totalMonto: 0,

  createFactura: async (facturaInfo) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/facturas/", facturaInfo);
      set({ facturaData: response.data, isFacturaCreated: true });
      return response.data;
    } catch (error) {
      console.error("Error creando factura:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getFacturasDetalladas: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/facturas/detailed");
      const facturas = response.data.data || response.data || [];
      const totalMonto = facturas.reduce(
        (sum, factura) => sum + (factura.monto || 0),
        0
      );
      set({
        facturas,
        facturasFiltradas: facturas,
        totalMonto,
        isLoading: false,
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
        fecha: nuevaFecha,
      });

      const { facturas, facturasFiltradas } = get();

      const updatedFacturas = facturas.map((factura) =>
        factura._id === facturaId
          ? { ...factura, fecha: nuevaFecha }
          : factura
      );

      const updatedFacturasFiltradas = facturasFiltradas.map((factura) =>
        factura._id === facturaId
          ? { ...factura, fecha: nuevaFecha }
          : factura
      );

      set({
        facturas: updatedFacturas,
        facturasFiltradas: updatedFacturasFiltradas,
        isLoading: false,
      });
      console.log("Fecha actualizada:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error actualizando fecha:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  getFacturasFiltradas: async (filtros = {}) => {
    set({ isLoading: true });
    try {
      const filtrosLimpios = {};
      if (filtros.NIT && filtros.NIT.trim() !== "") {
        filtrosLimpios.nit = filtros.NIT.trim();
      }
      if (filtros.fecha && filtros.fecha.trim() !== "") {
        filtrosLimpios.fecha = filtros.fecha.trim();
      }

      const response = await api.get("/facturas/detailed", {
        params: filtrosLimpios,
      });

      const facturasFiltradas = response.data.data || [];

      set({
        facturasFiltradas,
        isLoading: false,
      });

      return facturasFiltradas;
    } catch (error) {
      console.error("Error filtrando facturas:", error);
      set({ isLoading: false });
      return [];
    }
  },

  filtrarPorNIT: async (nit) => {
    set({ isLoading: true });
    try {
      if (!nit || nit.trim() === "") {
        return await get().getFacturasDetalladas();
      }

      const nitBuscado = nit.trim();
      const response = await api.get("/facturas/detailed", {
        params: { nit: nitBuscado },
      });

      const facturasFiltradas = response.data.data || [];

      set({
        facturasFiltradas,
        isLoading: false,
      });

      return facturasFiltradas;
    } catch (error) {
      console.error("Error filtrando por NIT:", error);
      set({ isLoading: false });
      return [];
    }
  },

  limpiarFiltros: async () => {
    return await get().getFacturasDetalladas();
  },

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
  },
}));