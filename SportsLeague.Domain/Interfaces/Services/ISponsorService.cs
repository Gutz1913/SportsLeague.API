using SportsLeague.Domain.Entities;
using SportsLeague.Domain.Enums;

namespace SportsLeague.Domain.Interfaces.Services;

public interface ISponsorService
{
    Task<IEnumerable<Sponsor>> GetAllAsync();
    Task<Sponsor?> GetByIdAsync(int id);
    Task<Sponsor?> GetByIdWithTournamentAsync(int id);
    Task<Sponsor?> GetByNameAsync(string name);
    Task<Sponsor> CreateAsync(Sponsor sponsor);
    Task UpdateAsync(int id, Sponsor sponsor);
    Task DeleteAsync(int id);
    Task UpdateCategoryAsync(int id, SponsorCategory newCategory);
    Task RegisterSponsorToTournamentAsync(int tournamentId, int sponsorId, decimal contractAmount, DateTime? joinedAt = null);
    Task UnregisterSponsorFromTournamentAsync(int tournamentId, int sponsorId);
    Task<IEnumerable<TournamentSponsor>> GetTournamentsBySponsorAsync(int sponsorId);

}
