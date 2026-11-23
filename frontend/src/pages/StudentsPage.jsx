import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
import { getErrorMessage, lookupApi, studentApi } from "../api/services";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Load departments once for the filter dropdown.
  useEffect(() => {
    lookupApi.getDepartments().then(setDepartments).catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  // Reload students when the search text / department filter changes.
  // The 400 ms delay (debounce) avoids calling the API on every keystroke.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      studentApi
        .getAll(search.trim(), departmentId)
        .then((data) => !cancelled && setStudents(data))
        .catch((err) => !cancelled && toast.error(getErrorMessage(err)))
        .finally(() => !cancelled && setLoading(false));
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, departmentId, reloadKey]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await studentApi.remove(studentToDelete.id);
      toast.success(`${studentToDelete.fullName} was deleted.`);
      setStudentToDelete(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDepartmentId("");
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h4 className="mb-0">Students</h4>
        <Link to="/students/new" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>Add Student
        </Link>
      </div>

      <div className="card content-card">
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  className="form-control"
                  placeholder="Search by name or student ID (e.g. STU0001)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-8 col-md-4">
              <select
                className="form-select"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">All departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="col-4 col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>Clear</button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : students.length === 0 ? (
            <div className="text-center text-muted py-5">No students found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Course</th>
                    <th>Department</th>
                    <th>Enrolled</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td className="fw-semibold">{s.studentCode}</td>
                      <td>{s.fullName}</td>
                      <td>{s.email}</td>
                      <td>{s.phoneNumber}</td>
                      <td>{s.courseName}</td>
                      <td>{s.departmentName}</td>
                      <td>{s.enrollmentDate}</td>
                      <td className="text-end text-nowrap">
                        <Link to={`/students/${s.id}/edit`} className="btn btn-sm btn-outline-primary me-1" title="Edit">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete"
                          onClick={() => setStudentToDelete(s)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        show={!!studentToDelete}
        title="Delete student"
        message={`Are you sure you want to delete ${studentToDelete?.fullName}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setStudentToDelete(null)}
        busy={deleting}
      />
    </>
  );
}
