import React, { useEffect, useState } from "react";
import { useFacturaStore } from "../../hooks/HookFactura.jsx";
import { usePagoStore } from "../../hooks/HookPagos.jsx";
import { Search, XCircle, Edit2, Save, X, Plus } from "lucide-react";
import { FormsTemplate } from "./FormsTemplate.jsx";
import { FormsCobros } from "./FormsCobros.jsx";

export const ListaFacturas = () => {
  // Hook de pagos
  const {
    pagos,
    getPagos,
    createPago,
    isLoading: pagosLoading,
    error: pagosError,
    clearError
  } = usePagoStore();
  // Calcular días restantes de plazo
  const getDiasPlazoRestante = (fechaLimite) => {
    if (!fechaLimite) return null;
    const hoy = new Date();
    const diffMs = fechaLimite - hoy;
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDias > 0 ? diffDias : 0;
  };
  const {
    facturasFiltradas,
    isLoading,
    getFacturasDetalladas,
    getFacturasFiltradas,
    updateFacturaFecha,
  } = useFacturaStore();

  const [filtros, setFiltros] = useState({ NIT: "" });
  const [editingFecha, setEditingFecha] = useState(null);

  const [showForm, setShowForm] = useState(false); 
  const [showCobro, setShowCobro] = useState(false);
  // Elimina el estado local de cobros, ahora se usa pagos del hook
  const [facturasActualizadas, setFacturasActualizadas] = useState([]);

  const totalMonto = facturasFiltradas.reduce(
    (sum, factura) => sum + (factura.monto || 0),
    0
  );

  // Función para calcular fecha límite y días de atraso
  const getFechaLimite = (fechaString) => {
    if (!fechaString) return null;
    const fecha = new Date(fechaString);
    fecha.setDate(fecha.getDate() + 30);
    return fecha;
  };

  const getDiasAtraso = (fechaLimite) => {
    if (!fechaLimite) return null;
    const hoy = new Date();
    const diffMs = hoy - fechaLimite;
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDias > 0 ? diffDias : 0;
  };

  useEffect(() => {
    getFacturasDetalladas();
    getPagos();
  }, [getFacturasDetalladas, getPagos]);

  const handleFiltrar = () => {
    const filtrosActivos = Object.fromEntries(
      Object.entries(filtros).filter(([_, value]) => value !== "")
    );
    getFacturasFiltradas(filtrosActivos);
    getPagos(filtrosActivos);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({ NIT: "" });
    getFacturasDetalladas();
    getPagos();
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

  // ✅ Función para cerrar el formulario y refrescar la lista
  const handleFormClose = () => {
    setShowForm(false);
    getFacturasDetalladas(); // Refrescar la lista después de agregar
  };

  // ✅ Función para cerrar el formulario de cobro y refrescar la lista
  const handleCobroClose = () => {
    setShowCobro(false);
    getFacturasDetalladas(); // Refrescar la lista después de agregar
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
      {/* ✅ Header con botón de agregar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          📑 Listado de Facturas
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl shadow hover:bg-green-700 transition-all ml-[750px]"
        >
          <Plus size={20} /> Agregar Factura
        </button>
        <button
          onClick={() => setShowCobro(true)}
          className="flex items-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-xl shadow hover:bg-blue-800 transition-all"
        >
          💸 Registrar Cobro
        </button>
      </div>

      {/* ✅ Modal/Formulario para agregar facturas */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">📝 Nueva Factura</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <FormsTemplate onClose={handleFormClose} />
            </div>
          </div>
        </div>
      )}

      {showCobro && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <FormsCobros
                onClose={() => setShowCobro(false)}
                facturas={facturasActualizadas.length > 0 ? facturasActualizadas : facturasFiltradas}
                onSave={async (nuevoCobro) => {
                  try {
                    await createPago(nuevoCobro);
                    await getPagos();
                    getFacturasDetalladas();
                  } catch (error) {
                    alert("Error al guardar el pago: " + (error?.message || error));
                  }
                  setShowCobro(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

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

      {/* Tabla de Facturas */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border mb-8">
        <table className="min-w-full border-collapse">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
            <tr>
              {[
                "NIT",
                "Nombre",
                "Fecha",
                "Fecha límite",
                "Días de plazo",
                "Días de atraso",
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

              // Calcular fecha límite y días de atraso
              const fechaLimite = getFechaLimite(factura.fecha);
              const diasAtraso = getDiasAtraso(fechaLimite);
              const diasPlazoRestante = getDiasPlazoRestante(fechaLimite);

              return (
                <tr
                  key={uniqueKey}
                  className={`$
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
                  <td className="px-4 py-3 border-b">
                    {fechaLimite ? fechaLimite.toLocaleDateString("es-ES") : "N/A"}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {diasPlazoRestante !== null ? `${diasPlazoRestante} días` : "N/A"}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {diasAtraso > 0 ? `${diasAtraso} días` : "En plazo"}
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

      {/* Tabla de Pagos */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border">
        <table className="min-w-full border-collapse">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">NIT</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Boleta de Pago</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Monto a Pagar</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Fecha de Pago</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3 border-b">{pago.facturaId?.NIT || '-'}</td>
                <td className="px-4 py-3 border-b">{pago.boleta || "-"}</td>
                <td className="px-4 py-3 border-b font-semibold text-gray-700">Q{pago.montoPago}</td>
                <td className="px-4 py-3 border-b">{pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString("es-ES") : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pagosLoading && <div className="p-4 text-blue-600">Cargando pagos...</div>}
        {pagosError && <div className="p-4 text-red-600">Error: {pagosError}</div>}
      </div>

      {/* Sin datos */}
      {facturasFiltradas.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          🚫 No se encontraron facturas
        </div>
      )}
    </div>
  );
};