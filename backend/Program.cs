using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

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

app.MapGet("/api/books", (AppDbContext db, int pageNumber = 1, int pageSize = 5, bool sortByTitle = false, string? selectedCategory = null) =>
{
    var query = db.Books.AsQueryable();

    if (!string.IsNullOrEmpty(selectedCategory))
        query = query.Where(b => b.Category == selectedCategory);

    if (sortByTitle) query = query.OrderBy(b => b.Title);

    var totalCount = query.Count();
    var books = query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

    return Results.Ok(new { books, totalCount });
});

app.MapGet("/api/books/categories", (AppDbContext db) =>
{
    var categories = db.Books.Select(b => b.Category).Distinct().OrderBy(c => c).ToList();
    return Results.Ok(categories);
});

app.MapPost("/api/books", async (Book book, AppDbContext db) =>
{
    book.BookID = 0;
    db.Books.Add(book);
    await db.SaveChangesAsync();
    return Results.Created($"/api/books/{book.BookID}", book);
});

app.MapPut("/api/books/{id}", async (int id, Book input, AppDbContext db) =>
{
    var book = await db.Books.FindAsync(id);
    if (book is null) return Results.NotFound();

    book.Title = input.Title;
    book.Author = input.Author;
    book.Publisher = input.Publisher;
    book.ISBN = input.ISBN;
    book.Classification = input.Classification;
    book.Category = input.Category;
    book.PageCount = input.PageCount;
    book.Price = input.Price;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/books/{id}", async (int id, AppDbContext db) =>
{
    var book = await db.Books.FindAsync(id);
    if (book is null) return Results.NotFound();

    db.Books.Remove(book);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

