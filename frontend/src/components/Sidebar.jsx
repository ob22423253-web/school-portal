// Sidebar with role-aware links. We hide menu items the user cannot access
// rather than just disabling them — keeps the UI clean for each role.

import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linksByRole = {
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/courses', label: 'Courses' },
    { to: '/results', label: 'Results' },
    { to: '/users', label: 'Users' },
    { to: '/profile', label: 'Profile' },
  ],
  lecturer: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/courses', label: 'Courses' },
    { to: '/results', label: 'Results' },
    { to: '/profile', label: 'Profile' },
  ],
  student: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/courses', label: 'Courses' },
    { to: '/results', label: 'My Results' },
    { to: '/profile', label: 'Profile' },
  ],
  parent: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/courses', label: 'Courses' },
    { to: '/results', label: "Child's Results" },
    { to: '/profile', label: 'Profile' },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const links = (user && linksByRole[user.role]) || [];

  return (
    <>
      {/* Backdrop on mobile */}
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 md:hidden transition ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed md:static top-0 left-0 z-40 h-full w-64 transform border-r border-slate-200 bg-white transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-200 md:hidden">
          <span className="font-semibold">Menu</span>
          <button type="button" onClick={onClose} className="text-slate-500">
            ×
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={onClose}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
