import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import RouteErrorBoundary from '@/components/RouteErrorBoundary';
import StoriesPage from '@/pages/StoriesPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ItemPage from '@/pages/ItemPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        index: true,
        element: <Navigate to="/news" replace />,
      },
      {
        path: 'item/:id',
        element: (
          <ErrorBoundary>
            <ItemPage />
          </ErrorBoundary>
        ),
        ErrorBoundary: RouteErrorBoundary,
      },
      {
        path: ':type',
        element: (
          <ErrorBoundary>
            <StoriesPage />
          </ErrorBoundary>
        ),
        ErrorBoundary: RouteErrorBoundary,
      },
    ],
  },
  {
    path: '/login',
    element: (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    ),
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: '/register',
    element: (
      <ErrorBoundary>
        <RegisterPage />
      </ErrorBoundary>
    ),
    ErrorBoundary: RouteErrorBoundary,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
