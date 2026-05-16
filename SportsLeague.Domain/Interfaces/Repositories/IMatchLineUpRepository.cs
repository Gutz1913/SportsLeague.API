using SportsLeague.Domain.Entities;

namespace SportsLeague.Domain.Interfaces.Repositories;

public interface IMatchLineUpRepository : IGenericRepository<MatchLineUp>
{
    Task<bool> PlayerExistsInLineUpAsync(int matchId, int playerId);
    Task<int> CountStartersByTeamAndMatchAsync(int matchId, int teamId);
    Task<IEnumerable<MatchLineUp>> GetByMatchAsync(int matchId);
    Task<IEnumerable<MatchLineUp>> GetByMatchAndTeamAsync(int matchId, int teamId);
}
