import React, { useState } from "react";
import { useFacturaStore } from "../../hooks/HookFactura.jsx";
import { Save, XCircle, X } from "lucide-react";

export const FormsTemplate = ({ onClose }) => { // ✅ Aceptar prop onClose
    const { createFactura, isLoading } = useFacturaStore();

    const [formData, setFormData] = useState({
        NIT: "",
        nombreCliente: "",
        fecha: "",
        serie: "",
        numeroFactura: "",
        monto: ""
    });

    const [mensaje, setMensaje] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje(null);

        try {
            const facturaInfo = {
                ...formData,
                monto: parseFloat(formData.monto),
                fecha: new Date(formData.fecha).toISOString()
            };

            await createFactura(facturaInfo);

            setMensaje({ tipo: "success", texto: "✅ Factura agregada correctamente" });

            // Reiniciar formulario y cerrar después de 2 segundos
            setFormData({
                NIT: "",
                nombreCliente: "",
                fecha: "",
                serie: "",
                numeroFactura: "",
                monto: ""
            });

            setTimeout(() => {
                if (onClose) onClose(); // ✅ Cerrar el modal después de éxito
            }, 1500);

        } catch (error) {
            setMensaje({ tipo: "error", texto: "❌ Error al guardar la factura" });
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">📝 Nueva Factura</h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <X size={24} />
                </button>
            </div>

            {mensaje && (
                <div
                    className={`mb-4 p-3 rounded-xl text-white ${
                        mensaje.tipo === "success" ? "bg-green-500" : "bg-red-500"
                    }`}
                >
                    {mensaje.texto}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* ... (campos del formulario igual que antes) ... */}
                
                {/* Botones */}
                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-xl shadow hover:bg-gray-600 transition-all"
                    >
                        <XCircle size={18} /> Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        <Save size={18} />
                        {isLoading ? "Guardando..." : "Guardar Factura"}
                    </button>
                </div>
            </form>
        </div>
    );
};