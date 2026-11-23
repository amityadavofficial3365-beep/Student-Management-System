# Student Management System

A full-stack web application where an administrator logs in securely and manages student records (add, view, update, delete, search and filter), with a dashboard showing live statistics.

Built with **React**, **ASP.NET Core Web API**, **Entity Framework Core** and **PostgreSQL**.

## Features

- Admin login/logout with **JWT authentication** and **BCrypt password hashing**
- Dashboard: total students, courses, departments, new students this month, students per department, recent students
- Student CRUD: add, list, edit, delete (with confirmation popup)
- Search by **name or student ID**, filter by **department**
- Auto-generated student IDs (`STU0001`, `STU0002`, ...)
- Validation on both the frontend (React) and backend (ASP.NET Core)
- Proper HTTP status codes (200, 201, 204, 400, 401, 404, 409, 500) and global error handling
- Responsive Bootstrap 5 UI with sidebar, tables, forms and toast notifications
- Swagger page to try the API

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 (Vite), JavaScript, HTML5, CSS3, Bootstrap 5, Axios, React Router |
| Backend | C#, ASP.NET Core 8 Web API, Entity Framework Core 8 |
| Database | PostgreSQL |
| Security | JWT Bearer tokens, BCrypt.Net |
| Tools | VS Code, Git, GitHub, Postman |

## Project Structure

```
Student-Management-System/
├── backend/                      ASP.NET Core Web API
│   ├── Controllers/              HTTP endpoints (Auth, Students, Dashboard, Departments, Courses)
│   ├── Data/                     AppDbContext (database access) and DbSeeder (starter data)
│   ├── Dtos/                     Request/response shapes + validation rules
│   ├── Middleware/               Global exception handler
│   ├── Models/                   Entities = database tables (Admin, Department, Course, Student)
│   ├── Services/                 TokenService (creates JWT)
│   ├── Program.cs                App startup: services, auth, CORS, Swagger, pipeline
│   └── appsettings.json          Config with placeholders only (no secrets)
├── frontend/                     React app
│   └── src/
│       ├── api/                  Axios setup + all API calls
│       ├── context/              AuthContext (login state)
│       ├── components/           Layout, ProtectedRoute, StudentForm, StatCard, ConfirmModal
│       └── pages/                Login, Dashboard, Students, StudentForm, NotFound
├── database/
│   ├── schema.sql                Reference SQL for the tables
│   └── sample_data.sql           Optional demo students
├── screenshots/
├── README.md
└── .gitignore
```

## Database Design

```
Departments 1 ──── * Courses 1 ──── * Students          Admins (separate table, for login)
```

| Table | Columns |
|-------|---------|
| Admins | Id, Username (unique), PasswordHash |
| Departments | Id, Name (unique) |
| Courses | Id, Name, DepartmentId (FK) |
| Students | Id, StudentCode (unique), FullName, Email (unique), PhoneNumber, CourseId (FK), EnrollmentDate, CreatedAt |

A student's department comes from their course, so it is never stored twice.

## Installation

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/)

### 1. Create the database

Open `psql` (or pgAdmin) and run:

```sql
CREATE DATABASE student_management;
```

You can use your existing PostgreSQL user, or create a dedicated one:

```sql
CREATE USER sms_user WITH PASSWORD 'choose-your-own-password';
ALTER DATABASE student_management OWNER TO sms_user;
```

### 2. Configure and run the backend

```bash
cd backend
dotnet restore
```

Secrets are stored with **.NET user-secrets** (kept outside the project folder, so they are never committed). Replace the placeholder values with your own:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=student_management;Username=YOUR_DB_USER;Password=YOUR_DB_PASSWORD"
dotnet user-secrets set "Jwt:Key" "PASTE_A_RANDOM_TEXT_OF_AT_LEAST_32_CHARACTERS"
dotnet user-secrets set "Admin:Username" "admin"
dotnet user-secrets set "Admin:Password" "CHOOSE_A_STRONG_PASSWORD"
```

To generate a random JWT key: `openssl rand -base64 48` (Git Bash / Linux / macOS) or, in PowerShell,
`[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))`.

Create the first EF Core migration (one time) and start the API:

```bash
dotnet tool install --global dotnet-ef --version 8.*
dotnet ef migrations add InitialCreate -- --environment Development
dotnet run
```

On startup the API applies the migration (creates the tables), seeds departments/courses, and creates the admin account from your `Admin:` secrets. It listens on **http://localhost:5000**, and Swagger is at **http://localhost:5000/swagger**.

Commit the generated `backend/Migrations/` folder to Git.

> Prefer plain SQL? You can skip migrations and run `database/schema.sql` instead (use one approach, not both). Optional demo students: `database/sample_data.sql`.

### 3. Run the frontend

```bash
cd frontend
cp .env.example .env      # Windows: copy .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173** and log in with the admin username and password you set in step 2.

## API Documentation

Base URL: `http://localhost:5000/api`. All endpoints except login require the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description | Success | Errors |
|--------|----------|-------------|---------|--------|
| POST | `/auth/login` | Login, returns JWT token | 200 | 400, 401 |
| GET | `/students?search=&departmentId=` | List students (optional filters) | 200 | 401 |
| GET | `/students/{id}` | Get one student | 200 | 401, 404 |
| POST | `/students` | Add a student | 201 | 400, 401, 409 |
| PUT | `/students/{id}` | Update a student | 200 | 400, 401, 404, 409 |
| DELETE | `/students/{id}` | Delete a student | 204 | 401, 404 |
| GET | `/dashboard` | Dashboard statistics | 200 | 401 |
| GET | `/departments` | List departments | 200 | 401 |
| GET | `/courses?departmentId=` | List courses | 200 | 401 |

Example login request:

```json
POST /api/auth/login
{ "username": "admin", "password": "your-password" }
```

Example create-student request:

```json
POST /api/students
{
  "fullName": "Riya Sharma",
  "email": "riya@example.com",
  "phoneNumber": "9000000001",
  "courseId": 1,
  "enrollmentDate": "2025-07-15"
}
```

## Security

- Passwords are stored only as **BCrypt hashes**.
- Every data endpoint is protected with `[Authorize]` and validates the JWT (signature, issuer, audience, expiry).
- Secrets (DB password, JWT key, admin password) are **not in the repository**; use user-secrets or environment variables.
- The login error message is identical for a wrong username or password.
- Input is validated with data annotations on the API and checked again in the React form.
- CORS only allows the configured frontend origin (`Cors:AllowedOrigins`).
- The JWT is kept in the browser's `localStorage` (simple and fine for a learning project; a production app would typically prefer HttpOnly cookies).

## Screenshots

Add your screenshots to the `screenshots/` folder (see `screenshots/README.md`), then they will show here:

| Login | Dashboard |
|-------|-----------|
| ![Login](screenshots/login.png) | ![Dashboard](screenshots/dashboard.png) |

| Students | Add Student |
|----------|-------------|
| ![Students](screenshots/students.png) | ![Add student](screenshots/add-student.png) |

## Possible Future Improvements

Pagination, unit tests, course/department management screens, refresh tokens, Docker support.

## Author

Amit Yadav
