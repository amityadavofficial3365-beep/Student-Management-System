using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Api.Data;
using StudentManagement.Api.Dtos;

namespace StudentManagement.Api.Controllers;

// Read-only lists used to fill the dropdowns in the React forms.

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DepartmentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public DepartmentsController(AppDbContext db) => _db = db;

    // GET /api/departments
    [HttpGet]
    public async Task<ActionResult<List<DepartmentResponse>>> GetAll() =>
        Ok(await _db.Departments.AsNoTracking()
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentResponse { Id = d.Id, Name = d.Name })
            .ToListAsync());
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly AppDbContext _db;
    public CoursesController(AppDbContext db) => _db = db;

    // GET /api/courses?departmentId=1
    [HttpGet]
    public async Task<ActionResult<List<CourseResponse>>> GetAll([FromQuery] int? departmentId)
    {
        var query = _db.Courses.AsNoTracking().AsQueryable();
        if (departmentId.HasValue)
            query = query.Where(c => c.DepartmentId == departmentId.Value);

        return Ok(await query
            .OrderBy(c => c.Name)
            .Select(c => new CourseResponse
            {
                Id = c.Id,
                Name = c.Name,
                DepartmentId = c.DepartmentId,
                DepartmentName = c.Department!.Name
            })
            .ToListAsync());
    }
}
