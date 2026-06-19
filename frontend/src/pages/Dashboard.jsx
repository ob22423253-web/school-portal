// Role-aware dashboard. Each role gets cards relevant to what they can do.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { listCourses } from '../api/courseApi';
import { listResults } from '../api/resultApi';
import { listUsers } from '../api/userApi';
import Loader from '../components/Loader.jsx';

function Stat({ label, value, hint }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-800">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Run the calls in parallel and only ask for the count by passing limit=1.
        const requests = [listCourses({ limit: 1 }), listResults({ limit: 1 })];
        if (user.role === 'admin') requests.push(listUsers({ limit: 1 }));
        const responses = await Promise.all(requests);
        if (!alive) return;
        setStats({
          courses: responses[0]?.pagination?.total ?? 0,
          results: responses[1]?.pagination?.total ?? 0,
          users: responses[2]?.pagination?.total,
        });
      } catch {
        if (alive) setStats({ courses: 0, results: 0 });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user.role]);

  const greeting = `Hello, ${user.name.split(' ')[0]}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">{greeting}</h1>
        <p className="text-sm text-slate-500">
          You are signed in as <span className="font-medium text-slate-700">{user.role}</span>.
        </p>
      </div>

      {loading ? (
        <Loader label="Loading dashboard" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Courses" value={stats.courses} hint="Total courses on the system" />
          <Stat
            label={user.role === 'student' ? 'My results' : user.role === 'parent' ? "Child's results" : 'Results'}
            value={stats.results}
            hint="Records you can view"
          />
          {user.role === 'admin' && <Stat label="Users" value={stats.users} hint="Including all roles" />}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {user.role === 'admin' && (
          <Link to="/users" className="card p-4 hover:shadow-md transition">
            <h2 className="font-semibold text-slate-800">Manage users</h2>
            <p className="text-sm text-slate-500">Add lecturers, students and link parents.</p>
          </Link>
        )}
        {(user.role === 'admin' || user.role === 'lecturer') && (
          <Link to="/results" className="card p-4 hover:shadow-md transition">
            <h2 className="font-semibold text-slate-800">Enter results</h2>
            <p className="text-sm text-slate-500">Record student scores for your courses.</p>
          </Link>
        )}
        <Link to="/courses" className="card p-4 hover:shadow-md transition">
          <h2 className="font-semibold text-slate-800">Browse courses</h2>
          <p className="text-sm text-slate-500">See course codes, credits and lecturers.</p>
        </Link>
        <Link to="/profile" className="card p-4 hover:shadow-md transition">
          <h2 className="font-semibold text-slate-800">Your profile</h2>
          <p className="text-sm text-slate-500">Account details for your role.</p>
        </Link>
      </div>
    </div>
  );
}
