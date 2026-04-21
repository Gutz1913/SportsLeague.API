using SportsLeague.DataAccess.Context;
using SportsLeague.Domain.Entities;
using SportsLeague.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
namespace SportsLeague.DataAccess.Repositories;

public class MatchResultRepository : GenericRepository<MatchResult>, IMatchResultRepository
{
    public MatchResultRepository(LeagueDbContext context) : base(context) { }

    public async Task<MatchResult?> GetByMatchIdAsync(int matchId)
    {
        return await _dbSet.FirstOrDefaultAsync(mr => mr.MatchId == matchId);
    }
}
