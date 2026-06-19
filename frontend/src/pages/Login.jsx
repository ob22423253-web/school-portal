// Login page. Plain form -> auth context -> dashboard.

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useAlert } from '../context/AlertContext.jsx';
import FormInput from '../components/FormInput.jsx';
import Loader from '../components/Loader.jsx';

export default function Login() {
  const { login } = useAuth();
  const alert = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  // Mirror the backend validation rules so users see issues before submit.
  function validate() {
    const next = {};
    if (!form.email) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      await login(form.email, form.password);
      alert.success('Welcome back');
      const target = location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      alert.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="card w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-xl bg-brand-600 text-white flex items-center justify-center text-xl font-bold">
            S
          </div>
          <h1 className="mt-3 text-xl font-semibold text-slate-800">Sign in to School Portal</h1>
          <p className="text-sm text-slate-500">Use your school email and password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            error={errors.email}
            placeholder="you@school.gm"
            required
          />
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            error={errors.password}
            placeholder="••••••••"
            required
          />
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? <Loader inline size="sm" label="Signing in" /> : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          New student?{' '}
          <Link to="/register" className="text-brand-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
