/**
 * GENERADOR DE TICKET EN PDF
 *
 * Crea el ticket de cocina en formato papel térmico (80 mm) con jsPDF:
 * encabezado del restaurante, datos del pedido, productos, total y un
 * código de barras (CODE128) con el número de ticket.
 * El mismo diseño se usa para la vista previa en pantalla.
 */
import { jsPDF } from "jspdf"
import JsBarcode from "jsbarcode"

const ANCHO = 80
const MARGEN = 6

const textosModo = {
  domicilio: "A domicilio",
  llevar: "Para llevar",
  aqui: "Comer aquí",
}

function linea(doc, y) {
  doc.setDrawColor(180, 180, 180)
  doc.setLineDashPattern([1, 1], 0)
  doc.line(MARGEN, y, ANCHO - MARGEN, y)
  doc.setLineDashPattern([], 0)
}

function dibujarBarras(doc, digitos, y) {
  if (!digitos) return 0
  try {
    const canvas = document.createElement("canvas")
    JsBarcode(canvas, digitos, {
      format: "CODE128",
      width: 2,
      height: 56,
      fontSize: 14,
      margin: 0,
      displayValue: true,
    })
    const anchoMm = ANCHO - MARGEN * 2
    const altoMm = (canvas.height / canvas.width) * anchoMm
    doc.addImage(canvas.toDataURL("image/png"), "PNG", MARGEN, y, anchoMm, altoMm)
    return altoMm + 4
  } catch {
    return 0
  }
}

export function descargarTicketPDF(pedido) {
  if (!pedido) return

  const productos = pedido.productos ?? []
  const subtotal = productos.reduce((suma, p) => suma + p.precio * p.cantidad, 0)
  const digitos = (pedido.numero ?? "").replace(/\D/g, "")

  const doc = new jsPDF({ unit: "mm", format: [ANCHO, 135 + productos.length * 12] })
  let y = 14

  doc.setFont("courier", "bold")
  doc.setFontSize(16)
  doc.text("FoodApp", ANCHO / 2, y, { align: "center" })
  y += 6
  doc.setFont("courier", "normal")
  doc.setFontSize(10)
  doc.text("Ticket de compra", ANCHO / 2, y, { align: "center" })
  y += 8

  y += dibujarBarras(doc, digitos, y)

  doc.setFontSize(9)
  doc.text(`Ticket ${pedido.numero ?? ""}`, MARGEN, y)
  doc.text(
    new Date(pedido.fecha).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }),
    ANCHO - MARGEN,
    y,
    { align: "right" }
  )
  y += 6
  linea(doc, y)
  y += 7

  productos.forEach((item) => {
    const nombre = doc.splitTextToSize(
      `${item.cantidad} x ${item.nombre}`,
      ANCHO - MARGEN * 2 - 18
    )
    doc.text(nombre, MARGEN, y)
    doc.text(`$${(item.precio * item.cantidad).toFixed(2)}`, ANCHO - MARGEN, y, {
      align: "right",
    })
    y += 4.5 * nombre.length + 1.5
  })

  y += 1
  linea(doc, y)
  y += 7
  doc.text(`Subtotal: $${subtotal.toFixed(2)}`, MARGEN, y)
  y += 6
  doc.setFont("courier", "bold")
  doc.setFontSize(11)
  doc.text(`Total: $${(pedido.total ?? 0).toFixed(2)}`, MARGEN, y)
  y += 7
  doc.setFont("courier", "normal")
  doc.setFontSize(9)
  linea(doc, y)
  y += 7
  doc.text(
    `Método: ${pedido.metodoPago}${pedido.ultimos4 ? ` **** ${pedido.ultimos4}` : ""}`,
    MARGEN,
    y
  )
  y += 5
  doc.text(`Entrega: ${textosModo[pedido.modoPedido] ?? "A domicilio"}`, MARGEN, y)
  y += 9
  doc.text("Gracias por tu compra", ANCHO / 2, y, { align: "center" })

  doc.save(`ticket-${digitos || "compra"}.pdf`)
}