namespace SportsLeague.API.DTOs.Response;

public class SponsorWithSponsorshipsDTO : SponsorResponseDTO
{
    public IEnumerable<TournamentSponsorDTO> Sponsorships { get; set; } = new List<TournamentSponsorDTO>();
}

