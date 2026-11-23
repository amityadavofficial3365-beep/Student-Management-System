using Microsoft.AspNetCore.Mvc;

namespace StudentManagement.Api.Middleware;

// Catches any unhandled exception so the API returns a clean JSON error
// (HTTP 500) instead of leaking stack traces to the client.
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            var problem = new ProblemDetails
            {
                Status = 500,
                Title = "Server error",
                Detail = "Something went wrong on the server. Please try again later."
            };
            await context.Response.WriteAsJsonAsync(problem);
        }
    }
}
