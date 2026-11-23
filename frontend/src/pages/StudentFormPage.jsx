import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import StudentForm from "../components/StudentForm";
import { getErrorMessage, lookupApi, studentApi } from "../api/services";

const emptyValues = {
  fullName: "",
  email: "",
  phoneNumber: "",
  departmentId: "",
  courseId: "",
  enrollmentDate: "",
};

// /students/new  -> add mode      /students/:id/edit -> edit mode
export default function StudentFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [initialValues, setInitialValues] = useState(isEdit ? null : emptyValues);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [deps, crs] = await Promise.all([lookupApi.getDepartments(), lookupApi.getCourses()]);
        if (cancelled) return;
        setDepartments(deps);
        setCourses(crs);

        if (isEdit) {
          const s = await studentApi.getById(id);
          if (cancelled) return;
          setInitialValues({
            fullName: s.fullName,
            email: s.email,
            phoneNumber: s.phoneNumber,
            departmentId: String(s.departmentId),
            courseId: String(s.courseId),
            enrollmentDate: s.enrollmentDate,
          });
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate("/students");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, navigate]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setServerError("");
    try {
      if (isEdit) {
        await studentApi.update(id, payload);
        toast.success("Student updated successfully.");
      } else {
        await studentApi.create(payload);
        toast.success("Student added successfully.");
      }
      navigate("/students");
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h4 className="mb-3">{isEdit ? "Edit Student" : "Add Student"}</h4>
      <div className="card content-card">
        <div className="card-body">
          {serverError && <div className="alert alert-danger">{serverError}</div>}
          {!initialValues ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : (
            <StudentForm
              initialValues={initialValues}
              departments={departments}
              courses={courses}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitLabel={isEdit ? "Update Student" : "Save Student"}
            />
          )}
        </div>
      </div>
    </>
  );
}
