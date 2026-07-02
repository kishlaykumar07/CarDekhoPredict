using CarReasearch.API.Data;
using CarReasearch.API.Models;
using CarReasearch.API.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<RecommendationService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
    await DbSedder.SeedAsync(dbContext);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("FrontendPolicy");
app.UseHttpsRedirection();

app.MapPost("/api/recommendations", async (RecommendationRequest request, RecommendationService recommendationService) =>
    {
        var recommendations = await recommendationService.GetTopRecommendationsAsync(request);
        return Results.Ok(recommendations);
    })
    .WithName("GetRecommendations")
    .WithOpenApi();

app.MapGet("/api/cars/{id:int}", async (int id, AppDbContext dbContext) =>
    {
        var car = await dbContext.Cars.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        return car is null ? Results.NotFound() : Results.Ok(car);
    })
    .WithName("GetCarById")
    .WithOpenApi();

app.Run();
