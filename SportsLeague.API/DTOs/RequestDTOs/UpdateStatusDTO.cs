using SportsLeague.Domain.Enums;

namespace SportsLeague.API.DTOs.RequestDTOs;

public class UpdateStatusDTO
{
    public TournamentStatus Status { get; set; }
}
