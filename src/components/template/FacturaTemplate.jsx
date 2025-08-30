import React, { useEffect, useState } from "react";
import { useFacturaStore } from "../../hooks/HookFactura.jsx";
import { Search, XCircle, Edit2, Save, X } from "lucide-react";

export const ListaFacturas = () => {
  const {
    facturasFiltradas,
    isLoading,
    getFacturasDetalladas,
    getFacturasFiltradas,
    updateFacturaFecha,
  } = useFacturaStore();

  const [filtros, setFiltros] = useState({ NIT: "" });
  const [editingFecha, setEditingFecha] = useState(null);

  const totalMonto = facturasFiltradas.reduce(
    (sum, factura) => sum + (factura.monto || 0),
    0
  );

  useEffect(() => {
    getFacturasDetalladas();
  }, [getFacturasDetalladas]);

  const handleFiltrar = () => {
    const filtrosActivos = Object.fromEntries(
      Object.entries(filtros).filter(([_, value]) => value !== "")
    );
    getFacturasFiltradas(filtrosActivos);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({ NIT: "" });
    getFacturasDetalladas();
  };

  const iniciarEdicionFecha = (factura) => {
    setEditingFecha({
      facturaId: factura._id || factura.id,
      fechaTemporal: factura.fecha
        ? new Date(factura.fecha).toISOString().split("T")[0]
        : "",
    });
  };

  const cancelarEdicionFecha = () => setEditingFecha(null);

  const guardarFecha = async () => {
    if (!editingFecha.fechaTemporal) {
      alert("La fecha no puede estar vacía");
      return;
    }

    try {
      const [año, mes, dia] = editingFecha.fechaTemporal.split("-");
      const fechaUTC = new Date(Date.UTC(año, mes - 1, dia, 12, 0, 0));

      await updateFacturaFecha(editingFecha.facturaId, fechaUTC.toISOString());
      setEditingFecha(null);
    } catch (error) {
      console.error("Error al guardar la fecha:", error);
      alert("Error al actualizar la fecha");
    }
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "N/A";
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-ES");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 text-blue-500 font-semibold animate-pulse">
        ⏳ Cargando facturas...
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📑 Listado de Facturas
      </h1>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-6 border">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          🔎 Buscar por NIT
        </h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              NIT
            </label>
            <input
              type="text"
              value={filtros.NIT}
              onChange={(e) => setFiltros({ ...filtros, NIT: e.target.value })}
              placeholder="Ej. 123456-7"
              className="px-3 py-2 border rounded-xl shadow-sm w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleFiltrar}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition-all"
          >
            <Search size={18} /> Filtrar
          </button>
          <button
            onClick={handleLimpiarFiltros}
            className="flex items-center gap-2 bg-gray-500 text-white px-5 py-2 rounded-xl shadow hover:bg-gray-600 transition-all"
          >
            <XCircle size={18} /> Limpiar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border">
        <table className="min-w-full border-collapse">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
            <tr>
              {[
                "NIT",
                "Nombre",
                "Fecha",
                "Serie",
                "Número",
                "Monto",
                "Acciones",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {facturasFiltradas.map((factura, index) => {
              const uniqueKey =
                factura._id || factura.id || `${factura.NIT}-${factura.numeroFactura}`;
              const isEditing =
                editingFecha?.facturaId === (factura._id || factura.id);

              return (
                <tr
                  key={uniqueKey}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="px-4 py-3 border-b">{factura.NIT}</td>
                  <td className="px-4 py-3 border-b">{factura.nombreCliente}</td>
                  <td className="px-4 py-3 border-b">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={editingFecha.fechaTemporal}
                          onChange={(e) =>
                            setEditingFecha({
                              ...editingFecha,
                              fechaTemporal: e.target.value,
                            })
                          }
                          className="px-2 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                          onClick={guardarFecha}
                          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={cancelarEdicionFecha}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span
                        className="cursor-pointer text-blue-600 hover:underline"
                        onClick={() => iniciarEdicionFecha(factura)}
                      >
                        {formatearFecha(factura.fecha)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b">{factura.serie}</td>
                  <td className="px-4 py-3 border-b">{factura.numeroFactura}</td>
                  <td className="px-4 py-3 border-b font-semibold text-gray-700">
                    Q{factura.monto?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-3 border-b text-center">
                    {!isEditing && (
                      <button
                        onClick={() => iniciarEdicionFecha(factura)}
                        className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition"
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sin datos */}
      {facturasFiltradas.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          🚫 No se encontraron facturas
        </div>
      )}

      {/* Total */}
      {facturasFiltradas.length > 0 && (
        <div className="mt-6 text-right bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800">
            💰 Total:{" "}
            <span className="text-blue-600">Q{totalMonto.toFixed(2)}</span>
          </h3>
        </div>
      )}
    </div>
  );
};