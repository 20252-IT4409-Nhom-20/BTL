import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import News from '@/pages/News';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/:type" element={<News />} />
          <Route path="/" element={<Navigate to="/news" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
