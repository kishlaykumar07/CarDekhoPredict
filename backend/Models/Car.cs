using System.ComponentModel.DataAnnotations.Schema;

namespace CarReasearch.API.Models;

public class Car
{
    public int Id { get; set; }

    public string Make { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public string Varient { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public string FuelType { get; set; } = string.Empty;

    public int Seats { get; set; }

    public int MileageMpg { get; set; }

    public int SafetyRatings { get; set; }

    public int HorsePower { get; set; }

    public string UseCase { get; set; } = string.Empty;

    public string ReviewSummary { get; set; } = string.Empty;

    [NotMapped]
    public int MatchScore { get; set; }
}