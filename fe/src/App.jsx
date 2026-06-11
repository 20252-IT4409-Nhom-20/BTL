import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import StoriesPage from '@/pages/StoriesPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ItemPage from '@/pages/ItemPage';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/item/:id"
          element={
            <ErrorBoundary>
              <ItemPage />
            </ErrorBoundary>
          }
        />

        <Route
          path="/:type"
          element={
            <ErrorBoundary>
              <StoriesPage />
            </ErrorBoundary>
          }
        />

        <Route
          path="/login"
          element={
            <ErrorBoundary>
              <LoginPage />
            </ErrorBoundary>
          }
        />

        <Route
          path="/register"
          element={
            <ErrorBoundary>
              <RegisterPage />
            </ErrorBoundary>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
