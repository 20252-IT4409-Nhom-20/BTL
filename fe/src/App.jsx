import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NewsPage from './pages/NewsPage'
import ItemPage from './pages/ItemPage'
import './hn.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/item" element={<ItemPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
