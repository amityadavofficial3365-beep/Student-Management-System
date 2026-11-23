using System.Linq.Expressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Api.Data;
using StudentManagement.Api.Dtos;
using StudentManagement.Api.Models;

namespace StudentManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // every endpoint here needs a valid JWT
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public StudentsController(AppDbContext db) => _db = db;

    // Converts a Student entity into the StudentResponse DTO inside the SQL query.
    internal static readonly Expression<Func<Student, StudentResponse>> ToResponse = s => new StudentResponse
    {
        Id = s.Id,
        StudentCode = s.StudentCode,
        FullName = s.FullName,
        Email = s.Email,
        PhoneNumber = s.PhoneNumber,
        CourseId = s.CourseId,
        CourseName = s.Course!.Name,
        DepartmentId = s.Course.DepartmentId,
        DepartmentName = s.Course.Department!.Name,
        EnrollmentDate = s.EnrollmentDate
    };

    // GET /api/students?search=john&departmentId=2
    [HttpGet]
    public async Task<ActionResult<List<StudentResponse>>> GetAll([FromQuery] string? search, [FromQuery] int? departmentId)
    {
        IQueryable<Student> query = _db.Students.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            // Escape LIKE wildcards typed by the user, then search name OR student ID.
            var term = search.Trim().Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
            var pattern = $"%{term}%";
            query = query.Where(s => EF.Functions.ILike(s.FullName, pattern) ||
                                     EF.Functions.ILike(s.StudentCode, pattern));
        }

        if (departmentId.HasValue)
            query = query.Where(s => s.Course!.DepartmentId == departmentId.Value);

        var students = await query
            .OrderByDescending(s => s.Id)
            .Select(ToResponse)
            .ToListAsync();

        return Ok(students);
    }

    // GET /api/students/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<StudentResponse>> GetById(int id)
    {
        var student = await _db.Students.AsNoTracking()
            .Where(s => s.Id == id)
            .Select(ToResponse)
            .FirstOrDefaultAsync();

        return student is null ? NotFound(NotFoundProblem(id)) : Ok(student);
    }

    // POST /api/students
    [HttpPost]
    public async Task<ActionResult<StudentResponse>> Create(StudentRequest request)
    {
        var error = await ValidateBusinessRulesAsync(request, existingId: null);
        if (error is not null) return error;

        var student = new Student
        {
            // Temporary unique value; replaced by STU0001-style code once we know the Id.
            StudentCode = "TMP" + Guid.NewGuid().ToString("N")[..16],
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            PhoneNumber = request.PhoneNumber.Trim(),
            CourseId = request.CourseId,
            EnrollmentDate = request.EnrollmentDate!.Value
        };

        try
        {
            await using var tx = await _db.Database.BeginTransactionAsync();
            _db.Students.Add(student);
            await _db.SaveChangesAsync();               // Id is generated here

            student.StudentCode = $"STU{student.Id:D4}";
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch (DbUpdateException)
        {
            // Happens if two requests used the same email at the same time.
            return Conflict(new ProblemDetails { Status = 409, Title = "A student with this email already exists." });
        }

        var created = await _db.Students.AsNoTracking()
            .Where(s => s.Id == student.Id).Select(ToResponse).FirstAsync();

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/students/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<StudentResponse>> Update(int id, StudentRequest request)
    {
        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == id);
        if (student is null) return NotFound(NotFoundProblem(id));

        var error = await ValidateBusinessRulesAsync(request, existingId: id);
        if (error is not null) return error;

        student.FullName = request.FullName.Trim();
        student.Email = request.Email.Trim().ToLowerInvariant();
        student.PhoneNumber = request.PhoneNumber.Trim();
        student.CourseId = request.CourseId;
        student.EnrollmentDate = request.EnrollmentDate!.Value;

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new ProblemDetails { Status = 409, Title = "A student with this email already exists." });
        }

        var updated = await _db.Students.AsNoTracking()
            .Where(s => s.Id == id).Select(ToResponse).FirstAsync();
        return Ok(updated);
    }

    // DELETE /api/students/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == id);
        if (student is null) return NotFound(NotFoundProblem(id));

        _db.Students.Remove(student);
        await _db.SaveChangesAsync();
        return NoContent(); // 204
    }

    // Rules that attribute validation cannot check (they need the database).
    private async Task<ActionResult?> ValidateBusinessRulesAsync(StudentRequest request, int? existingId)
    {
        if (request.EnrollmentDate!.Value > DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)))
            return BadRequest(new ProblemDetails { Status = 400, Title = "Enrollment date cannot be in the future." });

        if (!await _db.Courses.AnyAsync(c => c.Id == request.CourseId))
            return BadRequest(new ProblemDetails { Status = 400, Title = "The selected course does not exist." });

        var email = request.Email.Trim().ToLowerInvariant();
        var emailTaken = await _db.Students.AnyAsync(s => s.Email == email && s.Id != existingId);
        if (emailTaken)
            return Conflict(new ProblemDetails { Status = 409, Title = "A student with this email already exists." });

        return null;
    }

    private static ProblemDetails NotFoundProblem(int id) =>
        new() { Status = 404, Title = $"Student with id {id} was not found." };
}
