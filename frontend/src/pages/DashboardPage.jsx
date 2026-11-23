import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import StatCard from "../components/StatCard";
import { dashboardApi, getErrorMessage } from "../api/services";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .get()
      .then(setData)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  }
  if (!data) {
    return <div className="alert alert-warning">Dashboard data could not be loaded.</div>;
  }

  const maxCount = Math.max(1, ...data.studentsByDepartment.map((d) => d.count));

  return (
    <>
      <h4 className="mb-4">Dashboard</h4>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Total Students" value={data.totalStudents} icon="bi-people-fill" color="#3b5bdb" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Total Courses" value={data.totalCourses} icon="bi-journal-bookmark-fill" color="#2f9e44" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Departments" value={data.totalDepartments} icon="bi-building" color="#f08c00" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="New This Month" value={data.newStudentsThisMonth} icon="bi-person-plus-fill" color="#d6336c" />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="card content-card h-100">
            <div className="card-body">
              <h6 className="mb-3">Students by Department</h6>
              {data.studentsByDepartment.length === 0 && (
                <p className="text-muted mb-0">No students yet.</p>
              )}
              {data.studentsByDepartment.map((d) => (
                <div className="mb-3" key={d.department}>
                  <div className="d-flex justify-content-between small mb-1">
                    <span>{d.department}</span>
                    <span className="fw-semibold">{d.count}</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${(d.count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card content-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Recent Students</h6>
                <Link to="/students" className="small">View all</Link>
              </div>
              {data.recentStudents.length === 0 ? (
                <p className="text-muted mb-0">No students yet. Add your first student.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr><th>ID</th><th>Name</th><th>Course</th><th>Enrolled</th></tr>
                    </thead>
                    <tbody>
                      {data.recentStudents.map((s) => (
                        <tr key={s.id}>
                          <td>{s.studentCode}</td>
                          <td>{s.fullName}</td>
                          <td>{s.courseName}</td>
                          <td>{s.enrollmentDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
