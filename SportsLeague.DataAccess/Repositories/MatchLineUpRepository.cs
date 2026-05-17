using Microsoft.EntityFrameworkCore;
using SportsLeague.DataAccess.Context;
using SportsLeague.Domain.Entities;
using SportsLeague.Domain.Interfaces.Repositories;

namespace SportsLeague.DataAccess.Repositories;

public class MatchLineUpRepository : GenericRepository<MatchLineUp>, IMatchLineUpRepository
{
    public MatchLineUpRepository(LeagueDbContext context) : base(context)
    {
    }

    public async Task<bool> PlayerExistsInLineUpAsync(int matchId, int playerId)
    {
        return await _dbSet.AsNoTracking()
            .AnyAsync(ml => ml.MatchId == matchId && ml.PlayerId == playerId);
    }

    public async Task<int> CountStartersByTeamAndMatchAsync(int matchId, int teamId)
    {
        return await _dbSet.AsNoTracking()
            .Where(ml => ml.MatchId == matchId && ml.IsStarter)
            .Join(_context.Players, ml => ml.PlayerId, p => p.Id, (ml, p) => p)
            .CountAsync(p => p.TeamId == teamId);
    }

    public async Task<IEnumerable<MatchLineUp>> GetByMatchIdAsync(int matchId)
    {
        return await _dbSet.AsNoTracking()
            .Where(ml => ml.MatchId == matchId)
            .Include(ml => ml.Match)
            .Include(ml => ml.Player)
            .ToListAsync();
    }

    public async Task<IEnumerable<MatchLineUp>> GetByMatchAndTeamAsync(int matchId, int teamId)
    {
        return await _dbSet
            .Where(ml => ml.MatchId == matchId
              && ml.Player.TeamId == teamId)
            .Include(ml => ml.Player)
            .ThenInclude(p => p.Team)
            .OrderBy(ml => ml.IsStarter ? 0 : 1)
            .ThenBy(ml => ml.Position)
            .ToListAsync();
    }
}