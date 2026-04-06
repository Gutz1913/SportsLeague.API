namespace SportsLeague.API.DTOs.ResponseDTOs;

public class SponsorWithSponsorshipsDTO : SponsorResponseDTO
{
    public IEnumerable<TournamentSponsorDTO> Sponsorships { get; set; } = new List<TournamentSponsorDTO>();
}

