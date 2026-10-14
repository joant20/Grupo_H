/**
 * HOOK useProductos
 *
 * Maneja la lista de productos del menú: los carga desde el backend al
 * abrir, y deja guardar, actualizar y borrar (recargando la lista sola).
 * Los errores muestran un aviso con useAviso.
 */
import { useState, useEffect } from "react"
import * as api from "../lib/api"
import { useAviso } from "./useAviso"

function useProductos() {
  const [productos, setProductos] = useState([])
  const { mostrarAviso } = useAviso()

  // Cargar productos al abrir
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.obtenerProductos()
        setProductos(res.data)
      } catch (error) {
        console.log("Error cargando productos:", error)
      }
    }
    cargar()
  }, [])

  const agregarProducto = async (producto) => {
    try {
      const res = await api.crearProducto(producto)
      setProductos([res.data, ...productos])
      mostrarAviso({
        titulo: "Producto creado",
        mensaje: `Se agregó "${res.data.nombre}" al catálogo.`,
        tipo: "exito",
      })
      return res.data
    } catch (error) {
      mostrarAviso({
        titulo: "No se pudo agregar el producto",
        mensaje: error.response?.data?.mensaje || "Error del servidor",
        tipo: "error",
      })
      throw error
    } 

  }

  const actualizarProducto = async (id, datos) => {
    try {
      const res = await api.actualizarProducto(id, datos)
      setProductos(productos.map((p) => (p._id === id ? res.data : p)))
      mostrarAviso({
        titulo: "Producto actualizado",
        mensaje: `Los cambios en "${res.data.nombre}" se guardaron.`,
        tipo: "exito",
      })
      return res.data
      
    } catch (error) {
      mostrarAviso({
        titulo: "No se pudo actualizar el producto",
        mensaje: error.response?.data?.mensaje || "Error del servidor",
        tipo: "error",
      })
      throw error
    }
  }

  const eliminarProducto = async (id) => {
  try {
    await api.desactivarProducto(id)
    setProductos(productos.map((p) => (p._id === id ? { ...p, disponible: false } : p)))
    mostrarAviso({
      titulo: "Producto eliminado",
      mensaje: "Se desactivó del catálogo.",
      tipo: "exito",
    })
  } catch (error) {
    mostrarAviso({
      titulo: "No se pudo eliminar",
      mensaje: error.response?.data?.mensaje || "Error del servidor",
      tipo: "error",
    })
    throw error
  }
}

  const obtenerProducto = (id) => productos.find((p) => p._id === id)

  const categorias = [...new Set(productos.map((p) => p.categoria))]

  return {
    productos,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerProducto,
    categorias,
  }
}

export default useProductos