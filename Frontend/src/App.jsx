/**
 * APP - el "plano" de toda la aplicación (Grupo H)
 *
 * Qué hace:
 *  1. Guarda la sesión del usuario (usuario + token) en localStorage, así que
 *     aunque recargues la página sigues logueado.
 *  2. Enruta: cada dirección del navegador ("/menu", "/carrito"...) muestra
 *     una página distinta.
 *  3. Protege las rutas del panel con <AdminRoute>, que deja pasar solo a
 *     admin y cocina.
 *
 * Orden de envoltura (importante):
 *   AvisoProvider (modales de avisos) → CarritoProvider (estado del carrito)
 *   → BrowserRouter (rutas) → páginas
 * Todo lo de adentro puede usar useAviso(), useCarrito() y los enlaces.
 */
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import HomePage from "./pages/HomePage"
import MenuPage from "./pages/MenuPage"
import AdminProductos from "./pages/admin/AdminProductos"
import AdminRoute from "./components/AdminRoute"
import AdminLayout from "./components/admin/AdminLayout"
import { CarritoProvider } from "./context/CarritoProvider"
import { AvisoProvider } from "./context/AvisoProvider"
import CarritoPage from "./pages/CarritoPage"
import CheckoutPage from "./pages/CheckoutPage"
import PedidoConfirmadoPage from "./pages/PedidoConfirmadoPage" 
import ServidorCaidoPage from "./pages/ServidorCaidoPage"
import VentasPage from "./pages/admin/VentasPage"
import TicketPage from "./pages/TicketPage"
import CocinaPage from "./pages/CocinaPage"
import AdminUsuarios from "./pages/admin/AdminUsuarios"
import MisPedidosPage from "./pages/MisPedidosPage"


function App() {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario")
    return guardado ? JSON.parse(guardado) : null
  })

  const handleLogin = (data) => {
  localStorage.setItem("usuario", JSON.stringify(data.usuario))
  localStorage.setItem("token", data.token)     
  setUsuario(data.usuario)
}

const handleRegister = (data) => {
  localStorage.setItem("usuario", JSON.stringify(data.usuario))
  localStorage.setItem("token", data.token)      
  setUsuario(data.usuario)
}

const handleLogout = () => {
  localStorage.removeItem("usuario")
  localStorage.removeItem("token")              
  setUsuario(null)
}

// El checkout actualiza teléfono/dirección del perfil: hay que reflejarlo aquí
// para que la próxima compra ya salga con los datos nuevos sin recargar
useEffect(() => {
  const alActualizarPerfil = (evento) => setUsuario(evento.detail)
  window.addEventListener("perfil:actualizado", alActualizarPerfil)
  return () => window.removeEventListener("perfil:actualizado", alActualizarPerfil)
}, [])

  return (
    <AvisoProvider>
    <CarritoProvider>
      <BrowserRouter>
        <Routes>
          <Route
  path="/admin/ventas"
  element={
    <AdminRoute usuario={usuario}>
      <AdminLayout usuario={usuario}>
        <VentasPage />
      </AdminLayout>
    </AdminRoute>
  }
/>

  

          <Route
            path="/admin/productos"
            element={
              <AdminRoute usuario={usuario}>
                <AdminLayout usuario={usuario}>
                  <AdminProductos />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
  path="/cocina"
  element={
    <AdminRoute usuario={usuario} roles={["admin", "cocina"]}>
      <AdminLayout usuario={usuario}>
        <CocinaPage />
      </AdminLayout>
    </AdminRoute>
  }
/>
          <Route
  path="/admin/usuarios"
  element={
    <AdminRoute usuario={usuario}>
      <AdminLayout usuario={usuario}>
        <AdminUsuarios />
      </AdminLayout>
    </AdminRoute>
  }
/>
        <Route path="/" element={<HomePage usuario={usuario} onLogout={handleLogout} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} usuario={usuario} onLogout={handleLogout} />} />
        <Route path="/registro" element={<RegisterPage onRegister={handleRegister} usuario={usuario} onLogout={handleLogout} />} />
        <Route path="/home" element={<HomePage usuario={usuario} onLogout={handleLogout} />} />
        <Route path="/mis-pedidos" element={<MisPedidosPage usuario={usuario} onLogout={handleLogout} />} />
        <Route path="/carrito" element={<CarritoPage usuario={usuario} onLogout={handleLogout} />} />
        <Route path="/checkout" element={<CheckoutPage usuario={usuario} onLogout={handleLogout} />} />
        <Route path="/servidor-caido" element={<ServidorCaidoPage />} />
        <Route path="/pedido/confirmado" element={<PedidoConfirmadoPage usuario={usuario} onLogout={handleLogout} />} />   
         <Route path="/ticket" element={<TicketPage usuario={usuario} onLogout={handleLogout} />} /> 
        <Route path="/menu" element={<MenuPage usuario={usuario} onLogout={handleLogout} />} />
      </Routes>
    </BrowserRouter>
    </CarritoProvider>
    </AvisoProvider>
  )
}

export default App