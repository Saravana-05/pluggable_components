import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@svar-ui/react-gantt/style.css"   // ← correct export path
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)