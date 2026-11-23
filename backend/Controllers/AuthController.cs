using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Api.Data;
using StudentManagement.Api.Dtos;
using StudentManagement.Api.Services;

namespace StudentManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokens;

    public AuthController(AppDbContext db, ITokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    // POST /api/auth/login  (public)
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var admin = await _db.Admins.FirstOrDefaultAsync(a => a.Username == request.Username.Trim());

        // Same message for "unknown user" and "wrong password" so attackers
        // cannot find out which usernames exist.
        if (admin is null || !BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash))
            return Unauthorized(new ProblemDetails { Status = 401, Title = "Invalid username or password." });

        var (token, expires) = _tokens.CreateToken(admin);
        return Ok(new LoginResponse { Token = token, Username = admin.Username, ExpiresAtUtc = expires });
    }
}
