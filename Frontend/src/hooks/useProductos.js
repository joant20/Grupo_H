import { useState, useEffect } from "react"
import * as api from "../lib/api"

function useProductos() {
  const [productos, setProductos] = useState([])

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
    const res = await api.crearProducto(producto)
    setProductos([res.data, ...productos])
    return res.data
  }

  const actualizarProducto = async (id, datos) => {
    const res = await api.actualizarProducto(id, datos)
    setProductos(productos.map((p) => (p._id === id ? res.data : p)))
    return res.data
  }

  const eliminarProducto = async (id) => {
    await api.desactivarProducto(id)
    setProductos(
      productos.map((p) => (p._id === id ? { ...p, disponible: false } : p))
    )
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