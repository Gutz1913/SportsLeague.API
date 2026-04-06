namespace SportsLeague.API.DTOs.ResponseDTOs;

public class TournamentSponsorDTO
{
    public int TournamentId { get; set; }
    public string TournamentName { get; set; } = string.Empty; // opcional para UI
    public decimal ContractAmount { get; set; }
    public DateTime JoinedAt { get; set; }
}

