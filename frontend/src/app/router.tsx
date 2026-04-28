import { Navigate, createBrowserRouter } from 'react-router-dom';

import { AuthGuard } from '../components/common/AuthGuard';
import { ArchitecturePage } from '../pages/architecture/ArchitecturePage';
import { AuthPage } from '../pages/auth/AuthPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { HtmlVariantPreviewPage } from '../pages/preview/HtmlVariantPreviewPage';
import { GeminiSettingsPage } from '../pages/settings/GeminiSettingsPage';

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/architecture',
        element: <ArchitecturePage />,
      },
      {
        path: '/settings/gemini',
        element: <GeminiSettingsPage />,
      },
      {
        path: '/preview/:id',
        element: <HtmlVariantPreviewPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
