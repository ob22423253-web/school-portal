// Self-registration page. Backend forces role=student for this endpoint.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useAlert } from '../context/AlertContext.jsx';
import FormInput from '../components/FormInput.jsx';
import Loader from '../components/Loader.jsx';

export default function Register() {
  const { register } = useAuth();
  const alert = useAlert();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.name || form.name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.password || form.password.length < 6)
      next.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) next.confirm = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      alert.success('Account created');
      navigate('/dashboard');
    } catch (err) {
      alert.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold text-slate-800">Create a student account</h1>
        <p className="text-sm text-slate-500 mb-4">
          Lecturers, parents and admins are created by the school administrator.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormInput
            label="Full name"
            name="name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            error={errors.name}
            placeholder="Awa Sanneh"
            required
          />
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
            required
          />
          <FormInput
            label="Confirm password"
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={(e) => update('confirm', e.target.value)}
            error={errors.confirm}
            required
          />
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? <Loader inline size="sm" label="Creating account" /> : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
