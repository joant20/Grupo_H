import { useState, useEffect } from "react"
import { productosIniciales } from "../Data/productosIniciales"

const STORAGE_KEY = "productos"

function useProductos() {
  const [productos, setProductos] = useState(() => {
    const guardados = localStorage.getItem(STORAGE_KEY)
    return guardados ? JSON.parse(guardados) : productosIniciales
  })

  // Guardar en localStorage cada vez que cambien los productos
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productos))
  }, [productos])

  const agregarProducto = (producto) => {
    const nuevoProducto = {
      ...producto,
      id: Date.now(), // ID único basado en timestamp
    }
    setProductos((prev) => [nuevoProducto, ...prev])
    return nuevoProducto
  }

  const actualizarProducto = (id, datos) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...datos } : p))
    )
  }

  const eliminarProducto = (id) => {
    setProductos((prev) => prev.filter((p) => p.id !== id))
  }

  const obtenerProducto = (id) => {
    return productos.find((p) => p.id === id)
  }

  // Extraer categorías únicas
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