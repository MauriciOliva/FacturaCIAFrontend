import React, { useState } from "react";

export const FormsCobros = ({ onClose, onSave, facturas }) => {
	const [formData, setFormData] = useState({
		facturaId: facturas && facturas.length > 0 ? facturas[0]._id || facturas[0].id : "",
		fechaPago: "",
		boleta: "",
		montoPago: ""
	});
	const [mensaje, setMensaje] = useState(null);

	// Manejar cambios en inputs
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Guardar cobro y pasar al padre
	const handleSubmit = (e) => {
		e.preventDefault();
		setMensaje(null);

		if (!formData.facturaId || !formData.fechaPago || !formData.boleta || !formData.montoPago) {
			setMensaje({ tipo: "error", texto: "Todos los campos son obligatorios" });
			return;
		}
		if (formData.montoPago < 0 || formData.montoPago > 1000000000) {
			setMensaje({ tipo: "error", texto: "El monto debe estar entre 0 y 1,000,000,000" });
			return;
		}

		// Enviar cobro al padre
		if (onSave) {
			onSave({ ...formData });
		}
		setMensaje({ tipo: "success", texto: "✅ Cobro registrado correctamente" });
		setTimeout(() => {
			if (onClose) onClose();
		}, 1000);
	};

	return (
		<div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-md">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold text-gray-800">💸 Nuevo Cobro</h2>
				<button
					onClick={onClose}
					className="text-gray-500 hover:text-gray-700"
				>
					×
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
				{/* Seleccionar Factura */}
				<div>
					<label className="block text-sm font-medium text-gray-600">Factura</label>
					<select
						name="facturaId"
						value={formData.facturaId}
						onChange={handleChange}
						required
						className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
					>
						{facturas && facturas.map(f => (
							<option key={f._id || f.id} value={f._id || f.id}>
								{f.serie || ""} {f.numeroFactura || ""} - {f.nombreCliente || f.NIT}
							</option>
						))}
					</select>
				</div>

				{/* Fecha de Pago */}
				<div>
					<label className="block text-sm font-medium text-gray-600">Fecha de Pago</label>
					<input
						type="date"
						name="fechaPago"
						value={formData.fechaPago}
						onChange={handleChange}
						required
						className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				{/* Boleta manual */}
				<div>
					<label className="block text-sm font-medium text-gray-600">Boleta de pago (texto)</label>
					<input
						type="text"
						name="boleta"
						value={formData.boleta}
						onChange={handleChange}
						required
						placeholder="Ej. 123456ABC"
						className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				{/* Monto de Pago */}
				<div>
					<label className="block text-sm font-medium text-gray-600">Monto de Pago (Q)</label>
					<input
						type="number"
						name="montoPago"
						value={formData.montoPago}
						onChange={handleChange}
						required
						min={0}
						max={1000000000}
						step="0.01"
						placeholder="Ej. 1500.50"
						className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				{/* Botones */}
				<div className="flex gap-3 justify-end">
					<button
						type="button"
						onClick={onClose}
						className="bg-gray-500 text-white px-4 py-2 rounded-xl shadow hover:bg-gray-600 transition-all"
					>
						Cancelar
					</button>
					<button
						type="submit"
						className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition-all"
					>
						Guardar Cobro
					</button>
				</div>
			</form>
		</div>
	);
};
