using Microsoft.EntityFrameworkCore;
using SportsLeague.DataAccess.Context;
using SportsLeague.Domain.Entities;
using SportsLeague.Domain.Interfaces.Repositories;

namespace SportsLeague.DataAccess.Repositories;

public class TournamentSponsorRepository : GenericRepository<TournamentSponsor>, ITournamentSponsorRepository
{
    public TournamentSponsorRepository(LeagueDbContext context) : base(context)
    {        
    }

    public async Task<TournamentSponsor?> GetByTournamentAndSponsorAsync(int tournamentId, int sponsorId)
    {
        return await _dbSet
            .Where(ts => ts.TournamentId == tournamentId && ts.SponsorId == sponsorId)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<TournamentSponsor>> GetByTournamentAsync(int tournamentId)
    {
        return await _dbSet
            .Where(ts => ts.TournamentId == tournamentId)
            .Include(ts => ts.Sponsor)
            .ToListAsync();
    }
}
