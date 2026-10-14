/**
 * PUNTO DE ENTRADA DEL FRONTEND
 *
 * Aquí se "enciende" React: toma el elemento <App /> y lo dibuja dentro
 * del <div id="root"> del index.html.
 *
 * StrictMode es una ayuda de desarrollo de React: activa avisos extra en
 * consola para encontrar errores (en producción no afecta).
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'   // estilos globales (Tailwind + animaciones)
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
