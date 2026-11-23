using Microsoft.EntityFrameworkCore;
using StudentManagement.Api.Models;

namespace StudentManagement.Api.Data;

// DbContext = the bridge between C# code and the PostgreSQL database.
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Student> Students => Set<Student>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Admin>(e =>
        {
            e.Property(x => x.Username).HasMaxLength(50).IsRequired();
            e.Property(x => x.PasswordHash).HasMaxLength(100).IsRequired();
            e.HasIndex(x => x.Username).IsUnique();
        });

        b.Entity<Department>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(100).IsRequired();
            e.HasIndex(x => x.Name).IsUnique();
        });

        b.Entity<Course>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(100).IsRequired();
            // One Department has many Courses. Restrict = cannot delete a
            // department that still has courses.
            e.HasOne(x => x.Department)
             .WithMany(d => d.Courses)
             .HasForeignKey(x => x.DepartmentId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.DepartmentId, x.Name }).IsUnique();
        });

        b.Entity<Student>(e =>
        {
            e.Property(x => x.StudentCode).HasMaxLength(20).IsRequired();
            e.Property(x => x.FullName).HasMaxLength(100).IsRequired();
            e.Property(x => x.Email).HasMaxLength(150).IsRequired();
            e.Property(x => x.PhoneNumber).HasMaxLength(20).IsRequired();
            // One Course has many Students.
            e.HasOne(x => x.Course)
             .WithMany(c => c.Students)
             .HasForeignKey(x => x.CourseId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => x.StudentCode).IsUnique();
            e.HasIndex(x => x.Email).IsUnique();
        });
    }
}
