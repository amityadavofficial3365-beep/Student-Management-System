using Microsoft.EntityFrameworkCore;
using StudentManagement.Api.Models;

namespace StudentManagement.Api.Data;

// Inserts starter data on startup: departments, courses and the first admin.
// The admin credentials come from configuration (user-secrets / env vars),
// never from the source code.
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, IConfiguration config, ILogger logger)
    {
        if (!await db.Departments.AnyAsync())
        {
            var data = new Dictionary<string, string[]>
            {
                ["Computer Science"] = new[] { "B.Sc Computer Science", "B.Sc Information Technology", "BCA" },
                ["Commerce"] = new[] { "B.Com", "B.Com Accounting and Finance" },
                ["Science"] = new[] { "B.Sc Physics", "B.Sc Chemistry" },
                ["Arts"] = new[] { "B.A English", "B.A Economics" }
            };

            foreach (var (deptName, courses) in data)
            {
                var dept = new Department { Name = deptName };
                foreach (var c in courses)
                    dept.Courses.Add(new Course { Name = c });
                db.Departments.Add(dept);
            }
            await db.SaveChangesAsync();
            logger.LogInformation("Seeded departments and courses.");
        }

        if (!await db.Admins.AnyAsync())
        {
            var username = config["Admin:Username"];
            var password = config["Admin:Password"];

            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                logger.LogWarning("No admin exists and Admin:Username / Admin:Password are not configured. " +
                                  "Set them with 'dotnet user-secrets' (see README) and restart.");
                return;
            }

            db.Admins.Add(new Admin
            {
                Username = username.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
            });
            await db.SaveChangesAsync();
            logger.LogInformation("Created admin user '{Username}'.", username);
        }
    }
}
