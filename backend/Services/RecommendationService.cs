using CarReasearch.API.Data;
using CarReasearch.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CarReasearch.API.Services;

public class RecommendationService
{
    private readonly AppDbContext _dbContext;

    public RecommendationService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Car>> GetTopRecommendationsAsync(RecommendationRequest request)
    {
        var cars = await _dbContext.Cars.AsNoTracking().ToListAsync();

        if (cars.Count == 0)
        {
            return new List<Car>();
        }

        var maxMileage = Math.Max(1, cars.Max(c => c.MileageMpg));
        var maxHorsePower = Math.Max(1, cars.Max(c => c.HorsePower));

        var scoredCars = cars
            .Select(car =>
            {
                var budgetScore = GetBudgetScore(car.Price, request.Budget);
                var useCaseScore = string.Equals(car.UseCase, request.UseCase, StringComparison.OrdinalIgnoreCase) ? 100d : 0d;
                var seatsScore = car.Seats >= request.Seats ? 100d : 0d;
                var fuelScore = string.Equals(request.FuelType, "No preference", StringComparison.OrdinalIgnoreCase) ||
                                string.Equals(car.FuelType, request.FuelType, StringComparison.OrdinalIgnoreCase)
                    ? 100d
                    : 0d;

                var priorityScore = GetPriorityScore(car, request.Priority, maxMileage, maxHorsePower);

                var weightedScore =
                    (budgetScore * 0.30d) +
                    (useCaseScore * 0.25d) +
                    (seatsScore * 0.20d) +
                    (fuelScore * 0.15d) +
                    (priorityScore * 0.10d);

                return new Car
                {
                    Id = car.Id,
                    Make = car.Make,
                    Model = car.Model,
                    Varient = car.Varient,
                    Price = car.Price,
                    FuelType = car.FuelType,
                    Seats = car.Seats,
                    MileageMpg = car.MileageMpg,
                    SafetyRatings = car.SafetyRatings,
                    HorsePower = car.HorsePower,
                    UseCase = car.UseCase,
                    ReviewSummary = car.ReviewSummary,
                    MatchScore = (int)Math.Round(weightedScore, MidpointRounding.AwayFromZero)
                };
            })
            .OrderByDescending(c => c.MatchScore)
            .ThenBy(c => c.Price)
            .Take(5)
            .ToList();

        return scoredCars;
    }

    private static double GetBudgetScore(decimal carPrice, decimal budget)
    {
        if (budget <= 0)
        {
            return 0d;
        }

        if (carPrice == budget)
        {
            return 100d;
        }

        var differenceRatio = (double)(Math.Abs(carPrice - budget) / budget);

        if (carPrice <= budget)
        {
            return Math.Max(0d, 100d - (differenceRatio * 60d));
        }

        return Math.Max(0d, 100d - (differenceRatio * 120d));
    }

    private static double GetPriorityScore(Car car, string priority, int maxMileage, int maxHorsePower)
    {
        if (string.IsNullOrWhiteSpace(priority))
        {
            return 50d;
        }

        if (string.Equals(priority, "safety", StringComparison.OrdinalIgnoreCase))
        {
            return Math.Clamp((car.SafetyRatings / 5d) * 100d, 0d, 100d);
        }

        if (string.Equals(priority, "economy", StringComparison.OrdinalIgnoreCase))
        {
            return Math.Clamp((car.MileageMpg / (double)maxMileage) * 100d, 0d, 100d);
        }

        if (string.Equals(priority, "performance", StringComparison.OrdinalIgnoreCase))
        {
            return Math.Clamp((car.HorsePower / (double)maxHorsePower) * 100d, 0d, 100d);
        }

        return 50d;
    }
}