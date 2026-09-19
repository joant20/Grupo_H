
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useState } from "react"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import HomePage from "./pages/HomePage"

function App() {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario")
    return guardado ? JSON.parse(guardado) : null
  })

  const handleLogin = (data) => {
    localStorage.setItem("usuario", JSON.stringify(data))
    setUsuario(data)
  }

  const handleRegister = (data) => {
    localStorage.setItem("usuario", JSON.stringify(data))
    setUsuario(data)
  }

  const handleLogout = () => {
    localStorage.removeItem("usuario")
    setUsuario(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage usuario={usuario} onLogout={handleLogout} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/registro" element={<RegisterPage onRegister={handleRegister} />} />
        <Route path="/home" element={<HomePage usuario={usuario} onLogout={handleLogout} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App