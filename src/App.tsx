import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HotLoader } from './framework/hotLoader'
import { Designer } from './designer/Designer'
import LandingPage from './pages/LandingPage'

export default function App() {
  const [loader, setLoader] = useState<any>(null)

  useEffect(() => {
    const l = new HotLoader('/custom-components')
    l.init().then(() => setLoader(l))
  }, [])

  if (!loader) return <div>Loading...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Designer loader={loader} />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  )
}