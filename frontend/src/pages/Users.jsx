// Users management page — admin only. Full CRUD plus role filter and
// parent-to-student linking.

import { useEffect, useState } from 'react';
import { useAlert } from '../context/AlertContext.jsx';
import { listUsers, createUser, updateUser, deleteUser } from '../api/userApi';
import FormInput from '../components/FormInput.jsx';
import Loader from '../components/Loader.jsx';
import Pagination from '../components/Pagination.jsx';
import Modal from '../components/Modal.jsx';

const empty = {
  name: '',
  email: '',
  password: '',
  role: 'student',
  linkedStudent: '',
};

const roleBadges = {
  admin: 'bg-rose-100 text-rose-700',
  lecturer: 'bg-indigo-100 text-indigo-700',
  student: 'bg-emerald-100 text-emerald-700',
  parent: 'bg-amber-100 text-amber-700',
};

export default function Users() {
  const alert = useAlert();
  const [data, setData] = useState([]);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await listUsers({
        page,
        limit: 10,
        q: q || undefined,
        role: roleFilter || undefined,
      });
      setData(res.data);
      setPagination(res.pagination);
    } catch (err) {
      alert.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Students for the parent-link dropdown.
  useEffect(() => {
    listUsers({ role: 'student', limit: 200 })
      .then((r) => setStudents(r.data))
      .catch(() => setStudents([]));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(u) {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      linkedStudent: u.linkedStudent?._id || '',
    });
    setErrors({});
    setModalOpen(true);
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.name || form.name.trim().length < 2) next.name = 'Name must be at least 2 chars';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!editing && (!form.password || form.password.length < 6))
      next.password = 'Password must be at least 6 chars';
    if (editing && form.password && form.password.length < 6)
      next.password = 'Password must be at least 6 chars';
    if (!['admin', 'lecturer', 'student', 'parent'].includes(form.role))
      next.role = 'Pick a role';
    if (form.role === 'parent' && !form.linkedStudent)
      next.linkedStudent = 'Pick the linked student';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        linkedStudent: form.role === 'parent' ? form.linkedStudent : null,
      };
      if (form.password) payload.password = form.password;
      if (editing) {
        await updateUser(editing._id, payload);
        alert.success('User updated');
      } else {
        await createUser(payload);
        alert.success('User created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      alert.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await deleteUser(confirmDelete._id);
      alert.success('User deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      alert.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Users</h1>
          <p className="text-sm text-slate-500">
            {pagination.total} user{pagination.total === 1 ? '' : 's'}
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          + New user
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          load();
        }}
        className="card p-3 grid gap-2 sm:grid-cols-4"
      >
        <input
          className="input sm:col-span-2"
          placeholder="Search by name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="lecturer">Lecturer</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>
        <button type="submit" className="btn-secondary">
          Search
        </button>
      </form>

      <div className="card overflow-hidden">
        {loading ? (
          <Loader label="Loading users" />
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">No users match.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Linked student</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                    <td className="px-4 py-3 text-slate-700">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${roleBadges[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.linkedStudent ? u.linkedStudent.name : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button type="button" className="btn-secondary" onClick={() => openEdit(u)}>
                        Edit
                      </button>
                      <button type="button" className="btn-danger" onClick={() => setConfirmDelete(u)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit user' : 'Create user'}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="user-form" className="btn-primary" disabled={busy}>
              {busy ? <Loader inline size="sm" label="Saving" /> : 'Save'}
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit} className="space-y-3" noValidate>
          <FormInput
            label="Name"
            name="name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            error={errors.name}
            required
          />
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            error={errors.email}
            required
          />
          <FormInput
            label={editing ? 'New password (leave blank to keep)' : 'Password'}
            type="password"
            name="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            error={errors.password}
            required={!editing}
          />
          <FormInput
            label="Role"
            as="select"
            name="role"
            value={form.role}
            onChange={(e) => update('role', e.target.value)}
            error={errors.role}
            required
          >
            <option value="admin">Admin</option>
            <option value="lecturer">Lecturer</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </FormInput>
          {form.role === 'parent' && (
            <FormInput
              label="Linked student"
              as="select"
              name="linkedStudent"
              value={form.linkedStudent}
              onChange={(e) => update('linkedStudent', e.target.value)}
              error={errors.linkedStudent}
              required
            >
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </FormInput>
          )}
        </form>
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete user"
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setConfirmDelete(null)}>
              Cancel
            </button>
            <button type="button" className="btn-danger" onClick={handleDelete} disabled={busy}>
              {busy ? <Loader inline size="sm" label="Deleting" /> : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Delete <span className="font-medium">{confirmDelete?.name}</span>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
