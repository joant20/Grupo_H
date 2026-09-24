import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useState } from "react"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import HomePage from "./pages/HomePage"
import MenuPage from "./pages/MenuPage"
import AdminProductos from "./pages/admin/AdminProductos"
import AdminRoute from "./components/AdminRoute"
import AdminLayout from "./components/admin/AdminLayout"



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

  return (
    <BrowserRouter>
      <Routes>
        <Route
  path="/admin/productos"
  element={
    <AdminRoute usuario={usuario}>
      <AdminLayout>
        <AdminProductos />
      </AdminLayout>
    </AdminRoute>
  }
/>
        <Route path="/" element={<HomePage usuario={usuario} onLogout={handleLogout} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/registro" element={<RegisterPage onRegister={handleRegister} />} />
        <Route path="/home" element={<HomePage usuario={usuario} onLogout={handleLogout} />} />
        <Route path="/menu" element={<MenuPage usuario={usuario} onLogout={handleLogout} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App