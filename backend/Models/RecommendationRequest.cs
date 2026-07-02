namespace CarReasearch.API.Models;

public class RecommendationRequest
{
    public decimal Budget { get; set; }

    public string UseCase { get; set; } = string.Empty;

    public int Seats { get; set; }

    public string FuelType { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;
}