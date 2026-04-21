using SportsLeague.DataAccess.Context;
using SportsLeague.Domain.Entities;
using SportsLeague.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace SportsLeague.DataAccess.Repositories;

public class GoalRepository : GenericRepository<Goal>, IGoalRepository
{
    public GoalRepository(LeagueDbContext context) : base(context) { }

    public async Task<IEnumerable<Goal>> GetByMatchAsync(int matchId)
    {
        return await _dbSet
            .Where(g => g.MatchId == matchId)
            .OrderBy(g => g.Minute) //De forma ascendente
                                    //OrderByDescending(g => g.Minute) //De forma descendente
            .ToListAsync();
    }

    public async Task<IEnumerable<Goal>> GetByMatchWithDetailsAsync(int matchId)
    {
        return await _dbSet
            .Where(g => g.MatchId == matchId)
            .Include(g => g.Player)
            //.ThenInclude(p => p.Team) // Incluye el equipo del jugador
            //.ThenInclude(t => t.TournamentTeams) // Incluye el país del equipo
            //.ThenInclude(tt => tt.Tournament) // Incluye el torneo del país
            .OrderBy(g => g.Minute)
            .ToListAsync();
    }
}
