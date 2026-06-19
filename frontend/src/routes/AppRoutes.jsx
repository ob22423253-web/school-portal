// All routes for the app. Public routes go straight to the page; everything
// else is wrapped in ProtectedRoute (auth check) and, when needed, RoleRoute.

import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import RoleRoute from '../components/RoleRoute.jsx';

import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Courses from '../pages/Courses.jsx';
import CourseDetail from '../pages/CourseDetail.jsx';
import Results from '../pages/Results.jsx';
import Users from '../pages/Users.jsx';
import Profile from '../pages/Profile.jsx';
import NotFound from '../pages/NotFound.jsx';

// Small helper so we don't repeat AppLayout > ProtectedRoute > page everywhere.
function Authed({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <Authed>
            <Dashboard />
          </Authed>
        }
      />
      <Route
        path="/courses"
        element={
          <Authed>
            <Courses />
          </Authed>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <Authed>
            <CourseDetail />
          </Authed>
        }
      />
      <Route
        path="/results"
        element={
          <Authed>
            <Results />
          </Authed>
        }
      />
      <Route
        path="/users"
        element={
          <Authed>
            <RoleRoute roles={['admin']}>
              <Users />
            </RoleRoute>
          </Authed>
        }
      />
      <Route
        path="/profile"
        element={
          <Authed>
            <Profile />
          </Authed>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
