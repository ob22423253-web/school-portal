// Courses list with search + pagination. Admin gets create/edit/delete.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useAlert } from '../context/AlertContext.jsx';
import { listCourses, createCourse, updateCourse, deleteCourse } from '../api/courseApi';
import { listUsers } from '../api/userApi';
import FormInput from '../components/FormInput.jsx';
import Loader from '../components/Loader.jsx';
import Pagination from '../components/Pagination.jsx';
import Modal from '../components/Modal.jsx';

const empty = { code: '', title: '', description: '', credits: 3, lecturer: '' };

export default function Courses() {
  const { user } = useAuth();
  const alert = useAlert();

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const [lecturers, setLecturers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const isAdmin = user.role === 'admin';

  async function load() {
    setLoading(true);
    try {
      const res = await listCourses({ page, limit: 10, q });
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

  // Lecturer dropdown is only used by admin in the create/edit form.
  useEffect(() => {
    if (!isAdmin) return;
    listUsers({ role: 'lecturer', limit: 100 })
      .then((r) => setLecturers(r.data))
      .catch(() => setLecturers([]));
  }, [isAdmin]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(course) {
    setEditing(course);
    setForm({
      code: course.code,
      title: course.title,
      description: course.description || '',
      credits: course.credits,
      lecturer: course.lecturer?._id || '',
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
    if (!form.code) next.code = 'Code is required';
    if (!form.title) next.title = 'Title is required';
    const c = Number(form.credits);
    if (!Number.isInteger(c) || c < 1 || c > 10) next.credits = 'Credits must be 1-10';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const payload = {
        ...form,
        credits: Number(form.credits),
        lecturer: form.lecturer || null,
      };
      if (editing) {
        await updateCourse(editing._id, payload);
        alert.success('Course updated');
      } else {
        await createCourse(payload);
        alert.success('Course created');
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
      await deleteCourse(confirmDelete._id);
      alert.success('Course deleted');
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
          <h1 className="text-2xl font-semibold text-slate-800">Courses</h1>
          <p className="text-sm text-slate-500">{pagination.total} total</p>
        </div>
        {isAdmin && (
          <button type="button" className="btn-primary" onClick={openCreate}>
            + New course
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          load();
        }}
        className="card p-3 flex gap-2"
      >
        <input
          className="input"
          placeholder="Search by code, title or description"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" className="btn-secondary">
          Search
        </button>
      </form>

      <div className="card overflow-hidden">
        {loading ? (
          <Loader label="Loading courses" />
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">No courses found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Credits</th>
                  <th className="px-4 py-3">Lecturer</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.code}</td>
                    <td className="px-4 py-3 text-slate-700">{c.title}</td>
                    <td className="px-4 py-3 text-slate-700">{c.credits}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.lecturer ? c.lecturer.name : <span className="text-slate-400">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link to={`/courses/${c._id}`} className="btn-secondary">
                        View
                      </Link>
                      {isAdmin && (
                        <>
                          <button type="button" className="btn-secondary" onClick={() => openEdit(c)}>
                            Edit
                          </button>
                          <button type="button" className="btn-danger" onClick={() => setConfirmDelete(c)}>
                            Delete
                          </button>
                        </>
                      )}
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
        title={editing ? 'Edit course' : 'Create course'}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="course-form" className="btn-primary" disabled={busy}>
              {busy ? <Loader inline size="sm" label="Saving" /> : editing ? 'Save changes' : 'Create'}
            </button>
          </>
        }
      >
        <form id="course-form" onSubmit={handleSubmit} className="space-y-3" noValidate>
          <FormInput
            label="Course code"
            name="code"
            value={form.code}
            onChange={(e) => update('code', e.target.value.toUpperCase())}
            error={errors.code}
            required
          />
          <FormInput
            label="Title"
            name="title"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            error={errors.title}
            required
          />
          <FormInput
            label="Credits"
            type="number"
            name="credits"
            value={form.credits}
            onChange={(e) => update('credits', e.target.value)}
            error={errors.credits}
            min={1}
            max={10}
            required
          />
          <FormInput
            label="Description"
            as="textarea"
            name="description"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
          <FormInput
            label="Lecturer"
            as="select"
            name="lecturer"
            value={form.lecturer}
            onChange={(e) => update('lecturer', e.target.value)}
          >
            <option value="">— Unassigned —</option>
            {lecturers.map((l) => (
              <option key={l._id} value={l._id}>
                {l.name} ({l.email})
              </option>
            ))}
          </FormInput>
        </form>
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete course"
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
          Are you sure you want to delete <span className="font-medium">{confirmDelete?.code}</span>?
          This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
