import React, { useEffect, useState } from "react";
import { useFacturaStore } from "../../hooks/HookFactura.jsx";
import { Search, XCircle, Edit2, Save, X, Download, Printer, Filter, Plus } from "lucide-react";

export const ListaFacturas = () => {
  const {
    facturasFiltradas,
    isLoading,
    getFacturasDetalladas,
    getFacturasFiltradas,
    filtrarPorNIT,
    updateFacturaFecha,
    totalMonto,
    facturas
  } = useFacturaStore();

  const [nitBuscado, setNitBuscado] = useState("");
  const [fechaBuscada, setFechaBuscada] = useState("");
  const [editingFecha, setEditingFecha] = useState(null);
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalFacturas: 0,
    promedioMonto: 0,
    facturaMasAlta: 0
  });

  // 🔄 Cargar datos al inicio
  useEffect(() => {
    getFacturasDetalladas();
  }, []);

  // 📊 Calcular estadísticas cuando cambian facturas
  useEffect(() => {
    if (facturasFiltradas.length > 0) {
      const total = facturasFiltradas.length;
      const promedio = totalMonto / total;
      const maxMonto = Math.max(...facturasFiltradas.map(f => f.monto || 0));
      
      setEstadisticas({
        totalFacturas: total,
        promedioMonto: promedio,
        facturaMasAlta: maxMonto
      });
    } else {
      setEstadisticas({
        totalFacturas: 0,
        promedioMonto: 0,
        facturaMasAlta: 0
      });
    }
  }, [facturasFiltradas, totalMonto]);

  // 🔍 Aplicar filtros
  const handleFiltrar = async () => {
    if (nitBuscado.trim()) {
      await filtrarPorNIT(nitBuscado);
    } else if (fechaBuscada) {
      await getFacturasFiltradas({ fecha: fechaBuscada });
    } else {
      await getFacturasDetalladas();
    }
  };

  // ❌ Limpiar filtros
  const handleLimpiarFiltros = () => {
    setNitBuscado("");
    setFechaBuscada("");
    getFacturasDetalladas();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleFiltrar();
    }
  };

  // ✏️ Iniciar edición de fecha
  const iniciarEdicionFecha = (factura) => {
    setEditingFecha({
      facturaId: factura._id || factura.id,
      fechaTemporal: factura.fecha
        ? new Date(factura.fecha).toISOString().split("T")[0]
        : "",
    });
  };

  const cancelarEdicionFecha = () => setEditingFecha(null);

  // 💾 Guardar nueva fecha
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

      // 🔄 Recargar después de editar
      await getFacturasDetalladas();
    } catch (error) {
      console.error("Error al guardar la fecha:", error);
      alert("Error al actualizar la fecha");
    }
  };

  // 🗓️ Formatear fecha
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "N/A";
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-GT");
  };

  // 💰 Formatear moneda
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ"
    }).format(monto);
  };

  const exportarPDF = () => alert("Función de exportación PDF habilitada pronto");
  const imprimirTabla = () => window.print();

  // ⏳ Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 text-blue-500 font-semibold animate-pulse">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
          ⏳ Cargando facturas...
        </div>
      </div>
    );
  }

  // 🎨 Render principal
  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📑 Sistema de Gestión de Facturas</h1>
          <p className="text-gray-600">Administra y consulta todas tus facturas</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 transition-all">
            <Plus size={18} /> Nueva Factura
          </button>
          <button 
            onClick={exportarPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl shadow hover:bg-red-700 transition-all"
          >
            <Download size={18} /> Exportar
          </button>
          <button 
            onClick={imprimirTabla}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl shadow hover:bg-purple-700 transition-all"
          >
            <Printer size={18} /> Imprimir
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-md border-l-4 border-blue-500">
          <h3 className="text-sm font-semibold text-gray-600">Total Facturas</h3>
          <p className="text-2xl font-bold text-blue-600">{estadisticas.totalFacturas}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-md border-l-4 border-green-500">
          <h3 className="text-sm font-semibold text-gray-600">Promedio por Factura</h3>
          <p className="text-2xl font-bold text-green-600">{formatearMoneda(estadisticas.promedioMonto)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-md border-l-4 border-purple-500">
          <h3 className="text-sm font-semibold text-gray-600">Factura Más Alta</h3>
          <p className="text-2xl font-bold text-purple-600">{formatearMoneda(estadisticas.facturaMasAlta)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-6 border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">🔍 Herramientas de Búsqueda</h2>
          <button
            onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <Filter size={18} />
            {mostrarFiltrosAvanzados ? "Ocultar Filtros" : "Filtros Avanzados"}
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-600 mb-1">🔎 Buscar por NIT</label>
            <input
              type="text"
              value={nitBuscado}
              onChange={(e) => setNitBuscado(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ej. 1234567890"
              className="w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {mostrarFiltrosAvanzados && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-600 mb-1">📅 Filtrar por Fecha</label>
              <input
                type="date"
                value={fechaBuscada}
                onChange={(e) => setFechaBuscada(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleFiltrar}
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <Search size={18} /> {isLoading ? "Buscando..." : "Aplicar Filtros"}
            </button>
            <button
              onClick={handleLimpiarFiltros}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gray-500 text-white px-6 py-2 rounded-xl shadow hover:bg-gray-600 transition-all disabled:opacity-50"
            >
              <XCircle size={18} /> Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                {["NIT", "Nombre Cliente", "Fecha", "Serie", "Número", "Monto", "Acciones"].map((header) => (
                  <th key={header} className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facturasFiltradas.map((factura, index) => {
                const uniqueKey = factura._id || factura.id || `factura-${index}`;
                const isEditing = editingFecha?.facturaId === (factura._id || factura.id);

                return (
                  <tr
                    key={uniqueKey}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition duration-200`}
                  >
                    <td className="px-6 py-4 border-b font-mono">{factura.NIT || "N/A"}</td>
                    <td className="px-6 py-4 border-b">
                      <div>
                        <div className="font-medium text-gray-900">{factura.nombreCliente || factura.NombreCliente || "Cliente no especificado"}</div>
                        {factura.idCliente && <div className="text-sm text-gray-500">ID: {factura.idCliente}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={editingFecha.fechaTemporal}
                            onChange={(e) => setEditingFecha({ ...editingFecha, fechaTemporal: e.target.value })}
                            className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                          />
                          <button
                            onClick={guardarFecha}
                            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
                            title="Guardar fecha"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={cancelarEdicionFecha}
                            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                            title="Cancelar edición"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          onClick={() => iniciarEdicionFecha(factura)}
                          title="Click para editar fecha"
                        >
                          📅 {formatearFecha(factura.fecha)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 border-b font-mono">{factura.serie || "N/A"}</td>
                    <td className="px-6 py-4 border-b font-mono">{factura.numeroFactura || factura.numero || "N/A"}</td>
                    <td className="px-6 py-4 border-b font-semibold text-green-700">{formatearMoneda(factura.monto || 0)}</td>
                    <td className="px-6 py-4 border-b text-center">
                      {!isEditing && (
                        <button
                          onClick={() => iniciarEdicionFecha(factura)}
                          className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition"
                          title="Editar fecha de factura"
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
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">No se encontraron facturas</h3>
            <p className="text-gray-600">Intenta con otros criterios de búsqueda</p>
          </div>
        )}
      </div>

      {/* Total y Resumen */}
      {facturasFiltradas.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Resumen Financiero</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Total Facturas:</span><span className="font-semibold">{estadisticas.totalFacturas}</span></div>
              <div className="flex justify-between"><span>Monto Total:</span><span className="font-semibold text-green-600">{formatearMoneda(totalMonto)}</span></div>
              <div className="flex justify-between"><span>Promedio por Factura:</span><span className="font-semibold">{formatearMoneda(estadisticas.promedioMonto)}</span></div>
              <div className="flex justify-between"><span>Factura Más Alta:</span><span className="font-semibold text-purple-600">{formatearMoneda(estadisticas.facturaMasAlta)}</span></div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl shadow-md text-white">
            <h3 className="text-xl font-semibold mb-4">💰 Total General</h3>
            <div className="text-3xl font-bold mb-2">{formatearMoneda(totalMonto)}</div>
            <p className="text-blue-100">{facturasFiltradas.length} factura(s) encontrada(s)</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>© 2024 Sistema de Gestión de Facturas - {new Date().getFullYear()}</p>
        <p>Mostrando {facturasFiltradas.length} de {facturas.length} facturas totales</p>
      </div>
    </div>
  );
};