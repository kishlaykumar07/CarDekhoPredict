using CarReasearch.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CarReasearch.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Car> Cars => Set<Car>();
}