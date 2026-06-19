// Plain 404 page.

import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-800">404</h1>
        <p className="mt-2 text-slate-600">The page you are looking for does not exist.</p>
        <Link to="/dashboard" className="btn-primary mt-4 inline-flex">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
