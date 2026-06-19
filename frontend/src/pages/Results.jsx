// Results page. Read-only for students/parents, full CRUD for admin/lecturer.
// The backend handles the scoping so we just render what comes back.

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAlert } from '../context/AlertContext.jsx';
import { listResults, createResult, updateResult, deleteResult } from '../api/resultApi';
import { listCourses } from '../api/courseApi';
import { listUsers } from '../api/userApi';
import FormInput from '../components/FormInput.jsx';
import Loader from '../components/Loader.jsx';
import Pagination from '../components/Pagination.jsx';
import Modal from '../components/Modal.jsx';

const empty = {
  student: '',
  course: '',
  score: '',
  semester: 'First',
  academicYear: '2024/2025',
};

const gradeColors = {
  A: 'bg-emerald-100 text-emerald-700',
  B: 'bg-sky-100 text-sky-700',
  C: 'bg-amber-100 text-amber-700',
  D: 'bg-orange-100 text-orange-700',
  F: 'bg-rose-100 text-rose-700',
};

export default function Results() {
  const { user } = useAuth();
  const alert = useAlert();

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ q: '', semester: '', academicYear: '' });

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const canEdit = useMemo(() => ['admin', 'lecturer'].includes(user.role), [user.role]);

  async function load() {
    setLoading(true);
    try {
      const res = await listResults({
        page,
        limit: 10,
        q: filters.q || undefined,
        semester: filters.semester || undefined,
        academicYear: filters.academicYear || undefined,
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

  // Fetch dropdown data only when we'll need it (admin/lecturer enter results).
  useEffect(() => {
    if (!canEdit) return;
    Promise.all([
      listUsers({ role: 'student', limit: 200 }).then((r) => setStudents(r.data)),
      listCourses({ limit: 200 }).then((r) => setCourses(r.data)),
    ]).catch(() => {
      // Lecturer doesn't have permission to list users — that's fine, we
      // fall back to letting them type the student id or use existing rows.
    });
  }, [canEdit]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(r) {
    setEditing(r);
    setForm({
      student: r.student._id,
      course: r.course._id,
      score: r.score,
      semester: r.semester,
      academicYear: r.academicYear,
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
    if (!editing && !form.student) next.student = 'Pick a student';
    if (!editing && !form.course) next.course = 'Pick a course';
    const s = Number(form.score);
    if (!Number.isFinite(s) || s < 0 || s > 100) next.score = 'Score must be 0-100';
    if (!['First', 'Second'].includes(form.semester)) next.semester = 'Pick a semester';
    if (!/^\d{4}\/\d{4}$/.test(form.academicYear))
      next.academicYear = 'Format like 2024/2025';
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
        score: Number(form.score),
      };
      if (editing) {
        // Only score/semester/year are editable post-create.
        await updateResult(editing._id, {
          score: payload.score,
          semester: payload.semester,
          academicYear: payload.academicYear,
        });
        alert.success('Result updated');
      } else {
        await createResult(payload);
        alert.success('Result added');
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
      await deleteResult(confirmDelete._id);
      alert.success('Result deleted');
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
          <h1 className="text-2xl font-semibold text-slate-800">Results</h1>
          <p className="text-sm text-slate-500">
            {pagination.total} record{pagination.total === 1 ? '' : 's'}
          </p>
        </div>
        {canEdit && (
          <button type="button" className="btn-primary" onClick={openCreate}>
            + Add result
          </button>
        )}
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
          placeholder="Search semester or academic year"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
        />
        <select
          className="input"
          value={filters.semester}
          onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
        >
          <option value="">All semesters</option>
          <option value="First">First</option>
          <option value="Second">Second</option>
        </select>
        <button type="submit" className="btn-secondary">
          Filter
        </button>
      </form>

      <div className="card overflow-hidden">
        {loading ? (
          <Loader label="Loading results" />
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">No results to show.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3">Year</th>
                  {canEdit && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{r.student?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.course ? `${r.course.code} ${r.course.title}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{r.score}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${gradeColors[r.grade]}`}>{r.grade}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.semester}</td>
                    <td className="px-4 py-3 text-slate-600">{r.academicYear}</td>
                    {canEdit && (
                      <td className="px-4 py-3 text-right space-x-2">
                        <button type="button" className="btn-secondary" onClick={() => openEdit(r)}>
                          Edit
                        </button>
                        <button type="button" className="btn-danger" onClick={() => setConfirmDelete(r)}>
                          Delete
                        </button>
                      </td>
                    )}
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
        title={editing ? 'Edit result' : 'Add result'}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="result-form" className="btn-primary" disabled={busy}>
              {busy ? <Loader inline size="sm" label="Saving" /> : 'Save'}
            </button>
          </>
        }
      >
        <form id="result-form" onSubmit={handleSubmit} className="space-y-3" noValidate>
          {!editing && (
            <>
              <FormInput
                label="Student"
                as="select"
                name="student"
                value={form.student}
                onChange={(e) => update('student', e.target.value)}
                error={errors.student}
                required
              >
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </FormInput>
              <FormInput
                label="Course"
                as="select"
                name="course"
                value={form.course}
                onChange={(e) => update('course', e.target.value)}
                error={errors.course}
                required
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </FormInput>
            </>
          )}
          <FormInput
            label="Score (0-100)"
            type="number"
            name="score"
            value={form.score}
            onChange={(e) => update('score', e.target.value)}
            error={errors.score}
            min={0}
            max={100}
            required
          />
          <FormInput
            label="Semester"
            as="select"
            name="semester"
            value={form.semester}
            onChange={(e) => update('semester', e.target.value)}
            error={errors.semester}
            required
          >
            <option value="First">First</option>
            <option value="Second">Second</option>
          </FormInput>
          <FormInput
            label="Academic Year"
            name="academicYear"
            value={form.academicYear}
            onChange={(e) => update('academicYear', e.target.value)}
            error={errors.academicYear}
            placeholder="2024/2025"
            required
          />
        </form>
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete result"
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
          Delete result for{' '}
          <span className="font-medium">
            {confirmDelete?.student?.name} — {confirmDelete?.course?.code}
          </span>
          ? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
