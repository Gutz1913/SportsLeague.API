using SportsLeague.Domain.Entities;

namespace SportsLeague.Domain.Interfaces.Services;

public interface IMatchLineUpService
{
    Task<IEnumerable<MatchLineUp>> GetAllAsync();
    Task<MatchLineUp?> GetByIdAsync(int id);
    Task<MatchLineUp> CreateAsync(MatchLineUp matchLineUp, int matchId, int playerId, bool isStarter, string position);
    Task UpdateAsync(int id, MatchLineUp matchLineUp);
    Task DeleteAsync(int id);
    Task<IEnumerable<MatchLineUp>> GetByMatchIdAsync(int matchId);
}
