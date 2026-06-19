// Single course view. Shows everything we know about a course plus its
// recent results (scoped by role of the logged-in user).

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCourse } from '../api/courseApi';
import { listResults } from '../api/resultApi';
import { useAlert } from '../context/AlertContext.jsx';
import Loader from '../components/Loader.jsx';

export default function CourseDetail() {
  const { id } = useParams();
  const alert = useAlert();
  const [course, setCourse] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [c, r] = await Promise.all([
          getCourse(id),
          listResults({ course: id, limit: 25 }),
        ]);
        if (!alive) return;
        setCourse(c);
        setResults(r.data);
      } catch (err) {
        if (alive) alert.error(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, alert]);

  if (loading) return <Loader label="Loading course" />;
  if (!course) return <p>Course not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/courses" className="text-sm text-brand-600 hover:underline">
          ← Back to courses
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-800">
          {course.code} — {course.title}
        </h1>
        <p className="text-sm text-slate-500">Credits: {course.credits}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-1">Description</h2>
          <p className="text-sm text-slate-600">
            {course.description || 'No description provided.'}
          </p>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-1">Lecturer</h2>
          {course.lecturer ? (
            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-800">{course.lecturer.name}</p>
              <p>{course.lecturer.email}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Not assigned yet.</p>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-3">
          <h2 className="font-semibold text-slate-800">Results for this course</h2>
        </div>
        {results.length === 0 ? (
          <div className="p-6 text-sm text-slate-500 text-center">No results available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3">Academic Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{r.student?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{r.score}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-brand-50 text-brand-700">{r.grade}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.semester}</td>
                    <td className="px-4 py-3 text-slate-600">{r.academicYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
