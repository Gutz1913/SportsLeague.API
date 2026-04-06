using SportsLeague.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace SportsLeague.API.DTOs.Request;

public class UpdateSponsorCategoryDTO
{
    [Required]
    public SponsorCategory Category { get; set; }
}
