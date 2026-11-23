import axiosClient from "./axiosClient";

// All API calls live here, so pages stay clean and easy to read.

export const authApi = {
  login: (username, password) =>
    axiosClient.post("/auth/login", { username, password }).then((r) => r.data),
};

export const studentApi = {
  getAll: (search, departmentId) =>
    axiosClient
      .get("/students", {
        params: {
          search: search || undefined,
          departmentId: departmentId || undefined,
        },
      })
      .then((r) => r.data),
  getById: (id) => axiosClient.get(`/students/${id}`).then((r) => r.data),
  create: (student) => axiosClient.post("/students", student).then((r) => r.data),
  update: (id, student) =>
    axiosClient.put(`/students/${id}`, student).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/students/${id}`),
};

export const lookupApi = {
  getDepartments: () => axiosClient.get("/departments").then((r) => r.data),
  getCourses: () => axiosClient.get("/courses").then((r) => r.data),
};

export const dashboardApi = {
  get: () => axiosClient.get("/dashboard").then((r) => r.data),
};

// Turns an API error into one readable message for a toast / alert.
export function getErrorMessage(error) {
  if (!error.response) {
    return "Cannot reach the server. Is the backend running?";
  }
  const data = error.response.data;
  if (data?.errors) {
    return Object.values(data.errors).flat().join(" ");
  }
  return data?.title || data?.detail || "Something went wrong.";
}
