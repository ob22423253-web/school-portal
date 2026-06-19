// Top navigation. Shows brand, the current user's role badge and a logout.

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const roleColors = {
  admin: 'bg-rose-100 text-rose-700',
  lecturer: 'bg-indigo-100 text-indigo-700',
  student: 'bg-emerald-100 text-emerald-700',
  parent: 'bg-amber-100 text-amber-700',
};

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600"
            aria-label="Open menu"
          >
            ☰
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">
              S
            </span>
            <span className="font-semibold text-slate-800">School Portal</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-slate-600">{user.name}</span>
                <span className={`badge ${roleColors[user.role] || 'bg-slate-100 text-slate-700'}`}>
                  {user.role}
                </span>
              </div>
              <button type="button" onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
