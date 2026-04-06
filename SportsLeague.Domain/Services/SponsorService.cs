using Microsoft.Extensions.Logging;
using SportsLeague.Domain.Entities;
using SportsLeague.Domain.Enums;
using SportsLeague.Domain.Interfaces.Repositories;
using SportsLeague.Domain.Interfaces.Services;

namespace SportsLeague.Domain.Services;

public class SponsorService : ISponsorService
{
    private readonly ISponsorRepository _sponsorRepository;
    private readonly ILogger<SponsorService> _logger;

    public SponsorService(ISponsorRepository sponsorRepository, ILogger<SponsorService> logger)
    {
        _sponsorRepository = sponsorRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<Sponsor>> GetAllAsync()
    {
        _logger.LogInformation("Retrieving all sponsors");
        return await _sponsorRepository.GetAllAsync();
    }

    public async Task<Sponsor?> GetByIdAsync(int id)
    {
        _logger.LogInformation("Retrieving sponsor with ID: {SponsorId}", id);
        var sponsor = await _sponsorRepository.GetByIdAsync(id);
        if (sponsor == null)        
            _logger.LogWarning("Sponsor with ID {SponsorId} not found", id);

        return sponsor;        
    }

    public async Task<Sponsor> CreateAsync(Sponsor sponsor)
    {
        //Validación de negocio: nombre único
        var existingSponsor = await _sponsorRepository.GetByNameAsync(sponsor.Name);
        if (existingSponsor != null)
        {
            _logger.LogWarning("Sponsor with name '{SponsorName}' already exists", sponsor.Name);
            throw new InvalidOperationException($"Ya existe un sponsor con el nombre '{sponsor.Name}'");
        }

        _logger.LogInformation("Creating sponsor: {SponsorName}", sponsor.Name);
        return await _sponsorRepository.CreateAsync(sponsor);
    }

    public async Task UpdateAsync(int id, Sponsor sponsor)
    {
        var existingSponsor = await _sponsorRepository.GetByIdAsync(id);
        if (existingSponsor == null)
        {
            _logger.LogWarning("Sponsor with ID {SponsorId} not found for update", id);
            throw new KeyNotFoundException($"No se encontró el sponsor con ID {id}");
        }

        //Validar nombre único(si cambió)

        if (existingSponsor.Name != sponsor.Name)
        {
            var sponsorWithSameName = await _sponsorRepository.GetByNameAsync(sponsor.Name);
            if (sponsorWithSameName != null)
            {
                throw new InvalidOperationException($"Ya existe un sponsor con el nombre '{sponsor.Name}'");
            }
        }

        existingSponsor.Name = sponsor.Name;
        existingSponsor.ContactEmail = sponsor.ContactEmail;
        existingSponsor.Phone = sponsor.Phone;
        existingSponsor.WebsiteUrl = sponsor.WebsiteUrl;
        existingSponsor.Category = sponsor.Category;

        _logger.LogInformation("Updating sponsor with ID: {SponsorId}", id);
        await _sponsorRepository.UpdateAsync(existingSponsor);
    }

    public async Task DeleteAsync(int id)
    {
        var exists = await _sponsorRepository.ExistsAsync(id);
        if (!exists)
        {
            _logger.LogWarning("Sponsor with ID {SponsorId} not found for deletion", id);
            throw new KeyNotFoundException($"No se encontró el sponsor con ID {id}");
        }

        _logger.LogInformation("Deleting sponsor with ID: {SponsorId}", id);
        await _sponsorRepository.DeleteAsync(id);
    }

    public async Task<Sponsor?> GetByIdWithTournamentAsync(int id)
    {
        _logger.LogInformation("Retrieving sponsor with tournaments for ID: {SponsorId}", id);

        var sponsor = await _sponsorRepository.GetByIdWithTournamentsAsync(id);

        if (sponsor == null)        
            _logger.LogWarning("Sponsor with ID {SponsorId} not found (with tournaments)", id);

        return sponsor;        
    }

    public async Task<Sponsor?> GetByNameAsync(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            _logger.LogInformation("GetByNameAsync called with empty or whitespace name");
        }

        _logger.LogInformation("Retrieving sponsor with Name: {SponsorName}", name);

        var sponsor = await _sponsorRepository.GetByNameAsync(name);

        if (sponsor == null)
            _logger.LogWarning("Sponsor with Name '{SponsorName}' not found", name);

        return sponsor;     
    }

    public async Task<IEnumerable<Sponsor>> GetSponsorsByTournamentAsync(int tournamentId)
    {
        _logger.LogInformation("Retrieving sponsors for tournament {TournamentId}", tournamentId);
        return await _sponsorRepository.GetByTournamentAsync(tournamentId);
    }

    public async Task RegisterSponsorToTournamentAsync(int tournamentId, int sponsorId, decimal contractAmount, DateTime? joinedAt = null)
    {
        //Obtiene sponsor con sus relaciones
        var sponsor = await _sponsorRepository.GetByIdWithTournamentsAsync(sponsorId);
        if (sponsor == null)
        {
            _logger.LogWarning("Sponsor with ID {SponsorId} not found for registration", sponsorId);
            throw new KeyNotFoundException($"No se encontró el sponsor con ID {sponsorId}");
        }

        //Evita duplicados
        if (sponsor.TournamentSponsors.Any(ts => ts.TournamentId == tournamentId))
        {
            _logger.LogWarning("Sponsor {SponsorId} is already registered to tournament {TournamentId}", sponsorId, tournamentId);
            throw new InvalidOperationException("El sponsor ya está registrado en ese torneo");
        }

        sponsor.TournamentSponsors.Add(new TournamentSponsor
        {
            TournamentId = tournamentId,
            SponsorId = sponsorId,
            ContractAmount = contractAmount,
            JoinedAt = joinedAt ?? DateTime.UtcNow
        });

        _logger.LogInformation("Registering sponsor {SponsorId} to tournament {TournamentId}", sponsorId, tournamentId);
        await _sponsorRepository.UpdateAsync(sponsor);
    }

    

    public async Task UnregisterSponsorFromTournamentAsync(int tournamentId, int sponsorId)
    {
        var sponsor = await _sponsorRepository.GetByIdWithTournamentsAsync(sponsorId);
        if (sponsor == null)
        {
            _logger.LogWarning("Sponsor with ID {SponsorId} not found for unregistration", sponsorId);
            throw new KeyNotFoundException($"No se encontró el sponsor con ID {sponsorId}");
        }

        var ts = sponsor.TournamentSponsors.FirstOrDefault(x => x.TournamentId == tournamentId && x.SponsorId == sponsorId);
        if (ts == null)
        {
            _logger.LogWarning("Sponsorship not found for Sponsor {SponsorId} and Tournament {TournamentId}", sponsorId, tournamentId);
            throw new KeyNotFoundException("No existe la relación de sponsorización iniciada");
        }

        sponsor.TournamentSponsors.Remove(ts);
        _logger.LogInformation("Unregistering sponsor {SponsorId} from tournament {TournamentId}", sponsorId, tournamentId);
        await _sponsorRepository.UpdateAsync(sponsor);
    }



    public async Task UpdateCategoryAsync(int id, SponsorCategory newCategory)
    {
        var sponsor = await _sponsorRepository.GetByIdAsync(id);
        if (sponsor == null)        
            throw new KeyNotFoundException($"No se encontró el sponsor con ID {id}");

        var oldCategory = sponsor.Category;
        //Si no hay cambio no hacemos nada
        if (oldCategory == newCategory)
        {
            _logger.LogInformation("No se actualiza la categoría del sponsor {SponsorId} porque ya es {Category}", id, newCategory);
        }

        sponsor.Category = newCategory;
        _logger.LogInformation("Updating sponsor category for ID {SponsorId} from {OldCategory} to {NewCategory}", id, oldCategory, newCategory);
        
    }
}
