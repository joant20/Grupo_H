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
    try {
      const res = await api.crearProducto(producto)
      setProductos([res.data, ...productos])
      alert("Producto creado") 
      return res.data
    } catch (error) {
      alert("No se pudo agregar el producto: " + (error.response?.data?.mensaje || "error del servidor"))
      throw error
    } 

  }

  const actualizarProducto = async (id, datos) => {
    try {
      const res = await api.actualizarProducto(id, datos)
      setProductos(productos.map((p) => (p._id === id ? res.data : p)))
      alert("Producto actualizado")      
      return res.data
      
    } catch (error) {
      alert("No se pudo actualizar el producto: " + (error.response?.data?.mensaje || "error del servidor"))
      throw error
    }
  }

  const eliminarProducto = async (id) => {
  try {
    alert("Producto Eliminado") 
    await api.desactivarProducto(id)
    setProductos(productos.map((p) => (p._id === id ? { ...p, disponible: false } : p)))
  } catch (error) {
    alert("No se pudo eliminar: " + (error.response?.data?.mensaje || "error del servidor"))
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