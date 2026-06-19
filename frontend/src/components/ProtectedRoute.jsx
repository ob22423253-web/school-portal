// Wraps a route so unauthenticated users get bounced to /login. Shows a loader
// during the initial auth bootstrap so we don't redirect prematurely.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function ProtectedRoute({ children }) {
  const { user, booting } = useAuth();
  const location = useLocation();

  if (booting) return <Loader label="Checking session" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
