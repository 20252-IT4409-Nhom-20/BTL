import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import StoriesPage from '@/pages/StoriesPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ItemPage from '@/pages/ItemPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route
            path="/item/:id"
            element={(
              <ErrorBoundary>
                <ItemPage />
              </ErrorBoundary>
            )}
          />
          <Route
            path="/:type"
            element={(
              <ErrorBoundary>
                <StoriesPage />
              </ErrorBoundary>
            )}
          />
          <Route path="/" element={<Navigate to="/news" replace />} />
        </Route>
        <Route
          path="/login"
          element={(
            <ErrorBoundary>
              <LoginPage />
            </ErrorBoundary>
          )}
        />
        <Route
          path="/register"
          element={(
            <ErrorBoundary>
              <RegisterPage />
            </ErrorBoundary>
          )}
        />
      </Routes>
    </BrowserRouter>
  );
}
