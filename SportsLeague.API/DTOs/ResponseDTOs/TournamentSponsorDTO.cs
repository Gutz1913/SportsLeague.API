namespace SportsLeague.API.DTOs.Response;

public class TournamentSponsorDTO
{
    public int TournamentId { get; set; }
    public string TournamentName { get; set; } = string.Empty; // opcional para UI
    public decimal ContractAmount { get; set; }
    public DateTime JoinedAt { get; set; }
}

