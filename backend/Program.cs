using Microsoft.EntityFrameworkCore;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();

app.MapGet("/api/books", (AppDbContext db, int pageNumber = 1, int pageSize = 5, bool sortByTitle = false) =>
{
    var query = db.Books.AsQueryable();
    if (sortByTitle) query = query.OrderBy(b => b.Title);

    var totalCount = query.Count();
    var books = query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

    return Results.Ok(new { books, totalCount });
});

app.Run();

