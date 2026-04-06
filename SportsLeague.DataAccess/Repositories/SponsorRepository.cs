using Microsoft.EntityFrameworkCore;
using SportsLeague.DataAccess.Context;
using SportsLeague.Domain.Entities;
using SportsLeague.Domain.Enums;
using SportsLeague.Domain.Interfaces.Repositories;

namespace SportsLeague.DataAccess.Repositories;

public class SponsorRepository : GenericRepository<Sponsor>, ISponsorRepository
{
    public SponsorRepository(LeagueDbContext context) : base(context)
    {
    }

    public async Task<Sponsor?> GetByNameAsync(string name)
    {
        return await _dbSet
            .Where(s => s.Name == name)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Sponsor>> GetByCategoryAsync(SponsorCategory category)
    {
        return await _dbSet
            .Where(s => s.Category == category)
            .ToListAsync();
    }

    public async Task<Sponsor?> GetByIdWithTournamentsAsync(int id)
    {
        return await _dbSet
            .Where(s => s.Id == id)
            .Include(s => s.TournamentSponsors)
            .ThenInclude(ts => ts.Tournament)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> ExistByNameAsync(string name)
    {
        return await _dbSet.AnyAsync(s => s.Name == name);
    }

    public async Task<bool> ExistByEmailAsync(string email)
    {
        return await _dbSet.AnyAsync(s => s.ContactEmail == email);
    }

    public async Task<IEnumerable<Sponsor>> GetByTournamentAsync(int tournamentId)
    {
        // Consulta la tabla de unión y devuelve sponsors distintos del torneo
        return await _context.TournamentSponsors
            .Where(ts => ts.TournamentId == tournamentId)
            .Select(ts => ts.Sponsor)
            .Distinct()
            .ToListAsync();
    }

    public async Task<bool> HasAnyTournamentAssociationsAsync(int sponsorId)
    {
        return await _context.TournamentSponsors
    .AsNoTracking()
    .AnyAsync(ts => ts.SponsorId == sponsorId);
    }
}
