import { useState } from "react";
import { Link } from "react-router-dom";

// Reusable form used for BOTH "Add student" and "Edit student".
const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StudentForm({ initialValues, departments, courses, onSubmit, submitting, submitLabel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  // Only show courses that belong to the selected department.
  const filteredCourses = courses.filter((c) => String(c.departmentId) === String(values.departmentId));
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "departmentId") next.courseId = ""; // reset course when department changes
      return next;
    });
  };

  const validate = () => {
    const e = {};
    if (values.fullName.trim().length < 2) e.fullName = "Full name must be at least 2 characters.";
    if (!EMAIL_REGEX.test(values.email.trim())) e.email = "Enter a valid email address.";
    if (!PHONE_REGEX.test(values.phoneNumber.trim())) e.phoneNumber = "Phone must be 7-15 digits (+, - and spaces allowed).";
    if (!values.departmentId) e.departmentId = "Select a department.";
    if (!values.courseId) e.courseId = "Select a course.";
    if (!values.enrollmentDate) e.enrollmentDate = "Select the enrollment date.";
    else if (values.enrollmentDate > today) e.enrollmentDate = "Enrollment date cannot be in the future.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phoneNumber: values.phoneNumber.trim(),
      courseId: Number(values.courseId),
      enrollmentDate: values.enrollmentDate,
    });
  };

  const field = (name) => `form-control ${errors[name] ? "is-invalid" : ""}`;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label">Full name</label>
          <input name="fullName" className={field("fullName")} value={values.fullName} onChange={handleChange} maxLength={100} />
          <div className="invalid-feedback">{errors.fullName}</div>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Email</label>
          <input name="email" type="email" className={field("email")} value={values.email} onChange={handleChange} maxLength={150} />
          <div className="invalid-feedback">{errors.email}</div>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Phone number</label>
          <input name="phoneNumber" className={field("phoneNumber")} value={values.phoneNumber} onChange={handleChange} maxLength={15} />
          <div className="invalid-feedback">{errors.phoneNumber}</div>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Enrollment date</label>
          <input name="enrollmentDate" type="date" max={today} className={field("enrollmentDate")} value={values.enrollmentDate} onChange={handleChange} />
          <div className="invalid-feedback">{errors.enrollmentDate}</div>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Department</label>
          <select name="departmentId" className={`form-select ${errors.departmentId ? "is-invalid" : ""}`} value={values.departmentId} onChange={handleChange}>
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <div className="invalid-feedback">{errors.departmentId}</div>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Course</label>
          <select name="courseId" className={`form-select ${errors.courseId ? "is-invalid" : ""}`} value={values.courseId} onChange={handleChange} disabled={!values.departmentId}>
            <option value="">{values.departmentId ? "Select course" : "Select a department first"}</option>
            {filteredCourses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="invalid-feedback">{errors.courseId}</div>
        </div>
      </div>

      <div className="mt-4 d-flex gap-2">
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </button>
        <Link to="/students" className="btn btn-outline-secondary">Cancel</Link>
      </div>
    </form>
  );
}
