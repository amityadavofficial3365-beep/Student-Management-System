using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Api.Dtos;

// DTOs (Data Transfer Objects) define exactly what the API receives and returns,
// so we never expose database entities (or password hashes) directly.

public class LoginRequest
{
    [Required, StringLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
}

public class StudentRequest
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(150)]
    public string Email { get; set; } = string.Empty;

    // 7-15 characters: digits, +, - or spaces (e.g. +91 97939 21814)
    [Required, RegularExpression(@"^[0-9+\-\s]{7,15}$", ErrorMessage = "Phone number must be 7-15 digits (may include +, - or spaces).")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Please select a course.")]
    public int CourseId { get; set; }

    [Required]
    public DateOnly? EnrollmentDate { get; set; }
}

public class StudentResponse
{
    public int Id { get; set; }
    public string StudentCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public DateOnly EnrollmentDate { get; set; }
}

public class DepartmentResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class CourseResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
}

public class DepartmentCount
{
    public string Department { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class DashboardResponse
{
    public int TotalStudents { get; set; }
    public int TotalCourses { get; set; }
    public int TotalDepartments { get; set; }
    public int NewStudentsThisMonth { get; set; }
    public List<DepartmentCount> StudentsByDepartment { get; set; } = new();
    public List<StudentResponse> RecentStudents { get; set; } = new();
}
