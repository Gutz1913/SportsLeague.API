using SportsLeague.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace SportsLeague.API.DTOs.RequestDTOs;

public class UpdateSponsorCategoryDTO
{
    [Required]
    public SponsorCategory Category { get; set; }
}
