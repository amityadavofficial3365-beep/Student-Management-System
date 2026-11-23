using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Api.Data;
using StudentManagement.Api.Dtos;

namespace StudentManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;
    public DashboardController(AppDbContext db) => _db = db;

    // GET /api/dashboard
    [HttpGet]
    public async Task<ActionResult<DashboardResponse>> Get()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var firstOfMonth = new DateOnly(today.Year, today.Month, 1);

        var response = new DashboardResponse
        {
            TotalStudents = await _db.Students.CountAsync(),
            TotalCourses = await _db.Courses.CountAsync(),
            TotalDepartments = await _db.Departments.CountAsync(),
            NewStudentsThisMonth = await _db.Students.CountAsync(s => s.EnrollmentDate >= firstOfMonth),

            StudentsByDepartment = await _db.Students.AsNoTracking()
                .GroupBy(s => s.Course!.Department!.Name)
                .Select(g => new DepartmentCount { Department = g.Key, Count = g.Count() })
                .OrderBy(x => x.Department)
                .ToListAsync(),

            RecentStudents = await _db.Students.AsNoTracking()
                .OrderByDescending(s => s.Id)
                .Take(5)
                .Select(StudentsController.ToResponse)
                .ToListAsync()
        };

        return Ok(response);
    }
}
