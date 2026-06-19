// Wraps a route so only the listed roles can see it. Anyone else is bounced
// to the dashboard with a "no access" message.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function RoleRoute({ roles = [], children }) {
  const { user, booting } = useAuth();
  if (booting) return <Loader label="Checking access" />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
