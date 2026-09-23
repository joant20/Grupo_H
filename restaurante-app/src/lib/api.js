import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3001/api",  // ← Cambia esto cuando tu backend esté listo
})

export const registrarUsuario = (datos) => {
  return api.post("/registro", datos)
}

export const loginUsuario = (datos) => {
  return api.post("/login", datos)
}