import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useCarrito } from "../hooks/useCarrito"
import { useState } from "react"
import ModalConfirmacion from "../components/ModalConfirmacion"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Input from "../components/ui/input"
import TextArea from "../components/ui/TextArea"

const detectarModoInicial = () => {
  const esMovil =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 767px)").matches
  return esMovil ? "domicilio" : "llevar"
}


const crearSchema = (requiereNombre) =>
  z
    .object({
      nombre: requiereNombre
        ? z.string().min(3, "Ingresa tu nombre completo")
        : z.string().optional(),
      modoPedido: z.string().min(1, "Selecciona cómo quieres tu pedido"),
      direccion: z.string().optional(),
      telefono: z.string().optional(),
      notas: z.string().optional(),
      metodoPago: z.string().min(1, "Selecciona un método de pago"),
      numeroTarjeta: z.string().optional(),
      vencimiento: z.string().optional(),
      cvv: z.string().optional(),
    })
    .superRefine((datos, ctx) => {
      // Dirección obligatoria SOLO en domicilio (va ANTES del return de tarjeta)
      if (
        datos.modoPedido === "domicilio" &&
        (datos.direccion ?? "").trim().length < 10
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["direccion"],
          message: "La dirección debe tener al menos 10 caracteres",
        })
      }

      // Teléfono obligatorio en todos los modos EXCEPTO "Comer aquí"
      if (
        datos.modoPedido !== "aqui" &&
        !/^\d{10}$/.test(datos.telefono ?? "")
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["telefono"],
          message: "El teléfono debe tener 10 dígitos (sin espacios)",
        })
      }

      // Si NO eligió tarjeta, no validamos nada de tarjeta
      if (datos.metodoPago !== "Tarjeta") return
      // ... resto igual
      const digitos = (datos.numeroTarjeta ?? "").replace(/\D/g, "")
      if (digitos.length !== 16) {
        ctx.addIssue({
          code: "custom",
          path: ["numeroTarjeta"],
          message: "Ingresa los 16 dígitos de la tarjeta",
        })
      }

      const venc = (datos.vencimiento ?? "").replace(/\D/g, "")
      if (!/^(0[1-9]|1[0-2])\d{2}$/.test(venc)) {
        ctx.addIssue({
          code: "custom",
          path: ["vencimiento"],
          message: "Vencimiento inválido (usa MM/AA)",
        })
      }

      const cvv = (datos.cvv ?? "").replace(/\D/g, "")
      if (cvv.length !== 3) {
        ctx.addIssue({
          code: "custom",
          path: ["cvv"],
          message: "El CVV tiene 3 dígitos",
        })
      }
    })
    
    // Convierte "4111111111111111" en "4111 1111 1111 1111" mientras el usuario escribe
const formatearNumero = (e) => {
  const digitos = e.target.value.replace(/\D/g, "").slice(0, 16)
  e.target.value = digitos.replace(/(\d{4})(?=\d)/g, "$1 ")
}

// Convierte "1228" en "12/28"
const formatearVencimiento = (e) => {
  const digitos = e.target.value.replace(/\D/g, "").slice(0, 4)
  e.target.value =
    digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos
}

// Deja solo 3 dígitos
const formatearCVV = (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3)
}


function CheckoutPage({ usuario, onLogout }) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [datosEnvio, setDatosEnvio] = useState(null)
  const { carrito, totalCarrito, cantidadItems, vaciarCarrito } = useCarrito()
  const navigate = useNavigate()

 const schema = crearSchema(!usuario)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      modoPedido: detectarModoInicial(), 
      nombre: usuario?.nombre ?? "",
      direccion: "",
      telefono: "",
      notas: "",
      metodoPago: "",
      numeroTarjeta: "",
      vencimiento: "",
      cvv: "",
    },
  })

  const metodoPagoSeleccionado = watch("metodoPago")
   const modoPedidoSeleccionado = watch("modoPedido")

  // El mayor tiempoPreparación del carrito (la cocina hace todo en paralelo)
  const tiempoPreparacion = carrito.reduce(
    (max, item) => Math.max(max, item.tiempoPreparacion ?? 0),
    0
  )

  const onSubmit = (datos) => {
    setDatosEnvio(datos)
    setModalAbierto(true)
  }

  if (carrito.length === 0) {
    return (
      <div className="min-h-screen bg-[#fef9f0]">
        <Navbar usuario={usuario} onLogout={onLogout} />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-5xl mb-4">🛒</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Tu carrito está vacío
          </h1>
          <Link
            to="/menu"
            className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-medium"
          >
            Ver el menú
          </Link>
        </div>
      </div>
    )
  }

   const confirmarPedido = () => {
    // FUTURO: aquí va el POST /api/orders (issue #24)
    const digitos = (datosEnvio.numeroTarjeta ?? "").replace(/\D/g, "")

    const pedido = {
      numero: `#${(Date.now() % 100000).toString().padStart(5, "0")}`,
      fecha: new Date().toISOString(),
      productos: carrito,
      total: totalCarrito,
      cantidadItems,
      nombre: datosEnvio.nombre,
      modoPedido: datosEnvio.modoPedido,
      direccion: datosEnvio.direccion,
      telefono: datosEnvio.telefono,
      notas: datosEnvio.notas,
      metodoPago: datosEnvio.metodoPago,
      // POR SEGURIDAD: jamás guardamos la tarjeta completa, solo los últimos 4
      ultimos4: digitos ? digitos.slice(-4) : null,
    }

    sessionStorage.setItem("pedido_confirmado", JSON.stringify(pedido))
    vaciarCarrito()
    navigate("/pedido/confirmado", { state: { pedido } })
  }
  return (
    <div className="min-h-screen bg-[#fef9f0]">
      <Navbar usuario={usuario} onLogout={onLogout} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Confirmar pedido
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              ¿Cómo quieres tu pedido?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "domicilio", icono: "🛵", titulo: "A domicilio", sub: "Llega a tu puerta" },
                { id: "llevar", icono: "🥡", titulo: "Para llevar", sub: "Recoges en el local" },
                { id: "aqui", icono: "🍽", titulo: "Comer aquí", sub: "Mesa en el restaurante" },
              ].map((modo) => (
                <label
                  key={modo.id}
                  className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                    modoPedidoSeleccionado === modo.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={modo.id}
                    {...register("modoPedido")}
                    className="sr-only"
                  />
                  <span className="text-2xl">{modo.icono}</span>
                  <span className="flex-1">
                    <span className="block font-medium text-gray-800">{modo.titulo}</span>
                    <span className="block text-sm text-gray-500">{modo.sub}</span>
                  </span>
                  {modoPedidoSeleccionado === modo.id && (
                    <span className="w-6 h-6 shrink-0 rounded-full bg-orange-600 text-white text-sm flex items-center justify-center">
                      ✓
                    </span>
                  )}
                </label>
              ))}
            </div>

            {errors.modoPedido && (
              <p className="mt-2 text-sm text-red-500">{errors.modoPedido.message}</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Datos de entrega
            </h2>
            {!usuario && (
              <Input
                label="Nombre completo"
                id="nombre"
                placeholder="Nombre y apellidos"
                register={register("nombre")}
                error={errors.nombre}
              />
            )}

            {modoPedidoSeleccionado === "domicilio" && (
              <Input
                label="Dirección"
                id="direccion"
                placeholder="Calle, número, colonia"
                register={register("direccion")}
                error={errors.direccion}
              />
            )}

            {modoPedidoSeleccionado !== "aqui" && (
              <Input
                label="Teléfono"
                id="telefono"
                type="tel"
                placeholder="2220000000"
                register={register("telefono")}
                error={errors.telefono}
              />
            )}

            {modoPedidoSeleccionado === "domicilio" && (
              <TextArea
                label="Notas para el repartidor"
                id="notas"
                register={register("notas")}
                error={errors.notas}
              />
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Método de pago
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                  metodoPagoSeleccionado === "Efectivo"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  value="Efectivo"
                  {...register("metodoPago")}
                  className="sr-only"
                />
                <span className="text-2xl">💵</span>
                <span className="flex-1">
                  <span className="block font-medium text-gray-800">Efectivo</span>
                  <span className="block text-sm text-gray-500">Pagas al recibir</span>
                </span>
                {metodoPagoSeleccionado === "Efectivo" && (
                  <span className="w-6 h-6 shrink-0 rounded-full bg-orange-600 text-white text-sm flex items-center justify-center">
                    ✓
                  </span>
                )}
              </label>

              <label
                className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                  metodoPagoSeleccionado === "Tarjeta"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  value="Tarjeta"
                  {...register("metodoPago")}
                  className="sr-only"
                />
                <span className="text-2xl">💳</span>
                <span className="flex-1">
                  <span className="block font-medium text-gray-800">Tarjeta</span>
                  <span className="block text-sm text-gray-500">Crédito o débito</span>
                </span>
                {metodoPagoSeleccionado === "Tarjeta" && (
                  <span className="w-6 h-6 shrink-0 rounded-full bg-orange-600 text-white text-sm flex items-center justify-center">
                    ✓
                  </span>
                )}
              </label>
            </div>

            {errors.metodoPago && (
              <p className="mt-2 text-sm text-red-500">
                {errors.metodoPago.message}
              </p>
            )}

            {metodoPagoSeleccionado === "Tarjeta" && (
              <div className="mt-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Datos de la tarjeta
                </h3>

                <Input
                  label="Número de tarjeta"
                  id="numeroTarjeta"
                  placeholder="0000 0000 0000 0000"
                  register={register("numeroTarjeta", { onChange: formatearNumero })}
                  error={errors.numeroTarjeta}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Vencimiento"
                    id="vencimiento"
                    placeholder="MM/AA"
                    register={register("vencimiento", { onChange: formatearVencimiento })}
                    error={errors.vencimiento}
                  />
                  <Input
                    label="CVV"
                    id="cvv"
                    placeholder="123"
                    register={register("cvv", { onChange: formatearCVV })}
                    error={errors.cvv}
                  />
                </div>

                <p className="text-xs text-gray-400">
                  🔒 No guardamos tu tarjeta: se cobra al recibir el pedido.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Resumen</h2>

            {carrito.map((item) => (
              <div
                key={item._id}
                className="flex justify-between text-gray-600 mb-2 text-sm"
              >
                <span>
                  {item.cantidad} x {item.nombre}
                </span>
                <span>${(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}

            <hr className="my-4" />

            <div className="flex justify-between text-gray-600 mb-2">
              <span>Subtotal ({cantidadItems} productos)</span>
              <span>${totalCarrito.toFixed(2)}</span>
            </div>

            {tiempoPreparacion > 0 && (
              <div className="flex justify-between text-gray-600 mb-2">
                <span>⏱ Preparación</span>
                <span>~{tiempoPreparacion} min</span>
              </div>
            )}

            {modoPedidoSeleccionado === "domicilio" ? (
              <div className="flex justify-between text-gray-600 mb-4">
                <span>Envío</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
            ) : (
              <div className="flex justify-between text-gray-600 mb-4">
                <span>Entrega</span>
                <span className="text-green-600 font-medium">Recogida en tienda</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-2xl font-bold text-orange-600">
                ${totalCarrito.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="block w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg font-medium cursor-pointer"
          >
            Confirmar pedido
          </button>

          <Link
            to="/carrito"
            className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium mt-3"
          >
            Volver al carrito
          </Link>
        </form>

        {modalAbierto && (
          <ModalConfirmacion
            titulo="¿Confirmar tu pedido?"
            productos={carrito}
            total={totalCarrito}
            cantidadItems={cantidadItems}
            metodoPago={datosEnvio?.metodoPago}
            confirmarTexto="Sí, confirmar"
            onCancelar={() => setModalAbierto(false)}
            onConfirmar={() => {
              setModalAbierto(false)
              confirmarPedido()
            }}
          />
        )}
      </div>
    </div>
  )
}

export default CheckoutPage