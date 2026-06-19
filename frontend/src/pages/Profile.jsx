// Profile page. Anyone signed in can see their account details.

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAlert } from '../context/AlertContext.jsx';
import { getProfile } from '../api/userApi';
import Loader from '../components/Loader.jsx';

export default function Profile() {
  const { user } = useAuth();
  const alert = useAlert();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getProfile()
      .then((data) => alive && setMe(data))
      .catch((err) => alive && alert.error(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [alert]);

  if (loading) return <Loader label="Loading profile" />;
  if (!me) return <p>Could not load profile.</p>;

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-800">Your profile</h1>
      <div className="card divide-y divide-slate-100">
        <Row label="Name" value={me.name} />
        <Row label="Email" value={me.email} />
        <Row label="Role" value={user.role} />
        {me.linkedStudent && (
          <Row
            label="Linked student"
            value={`${me.linkedStudent.name} (${me.linkedStudent.email})`}
          />
        )}
        <Row label="Joined" value={new Date(me.createdAt).toLocaleDateString()} />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
