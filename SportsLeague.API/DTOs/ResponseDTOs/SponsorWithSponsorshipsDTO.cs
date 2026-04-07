namespace SportsLeague.API.DTOs.Response;

public class SponsorWithSponsorshipsDTO : SponsorResponseDTO
{
    public IEnumerable<TournamentSponsorResponseDTO> Sponsorships { get; set; } = new List<TournamentSponsorResponseDTO>();
}

