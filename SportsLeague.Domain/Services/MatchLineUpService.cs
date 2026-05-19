using Microsoft.Extensions.Logging;
using SportsLeague.Domain.Entities;
using SportsLeague.Domain.Enums;
using SportsLeague.Domain.Interfaces.Repositories;
using SportsLeague.Domain.Interfaces.Services;

namespace SportsLeague.Domain.Services;

public class MatchLineUpService : IMatchLineUpService
{
    private readonly IMatchLineUpRepository _matchLineUpRepository;
    private readonly IMatchRepository _matchRepository;
    private readonly IPlayerRepository _playerRepository;
    private readonly ILogger<MatchLineUpService> _logger;

    public MatchLineUpService(
        IMatchLineUpRepository matchLineUpRepository,
        IMatchRepository matchRepository,
        IPlayerRepository playerRepository,
        ILogger<MatchLineUpService> logger)
    {
        _matchLineUpRepository = matchLineUpRepository;
        _matchRepository = matchRepository;
        _playerRepository = playerRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<MatchLineUp>> GetAllAsync()
    {
        _logger.LogInformation("Retrieving all match line ups");
        return await _matchLineUpRepository.GetAllAsync();
    }

    public async Task<MatchLineUp?> GetByIdAsync(int id)
    {
        _logger.LogInformation("Retrieving match line up with ID: {MatchLineUpId}", id);
        var lineUp = await _matchLineUpRepository.GetByIdAsync(id);
        if (lineUp == null)
            _logger.LogWarning("Match line up with ID {MatchLineUpId} not found", id);

        return lineUp;
    }

    public async Task<IEnumerable<MatchLineUp>> GetByMatchIdAsync(int matchId)
    {
        _logger.LogInformation("Retrieving line ups for match {MatchId}", matchId);
        return await _matchLineUpRepository.GetByMatchIdAsync(matchId);
    }

    public async Task<IEnumerable<MatchLineUp>> GetByMatchAndTeamAsync(int matchId, int teamId)
    {
        _logger.LogInformation("Retrieving line ups for match {MatchId} and team {TeamId}", matchId, teamId);
        return await _matchLineUpRepository.GetByMatchAndTeamAsync(matchId, teamId);
    }

    public async Task<MatchLineUp> CreateAsync(int matchId, int playerId, bool isStarter, string position)
    {
        // V1: El partido debe existir
        var match = await _matchRepository.GetWithTeamsAndStatusAsync(matchId);
        if (match == null)
        {
            _logger.LogWarning("Match with ID {MatchId} not found for line up registration", matchId);
            throw new KeyNotFoundException($"No se encontró el partido con ID {matchId}");
        }

        // V2: El jugador debe existir
        var player = await _playerRepository.GetByIdAsync(playerId);
        if (player == null)
        {
            _logger.LogWarning("Player with ID {PlayerId} not found for line up registration", playerId);
            throw new KeyNotFoundException($"No se encontró el jugador con ID {playerId}");
        }

        // V3: El jugador debe pertenecer al HomeTeam o AwayTeam del partido
        if (player.TeamId != match.HomeTeamId && player.TeamId != match.AwayTeamId)
        {
            _logger.LogWarning("Player {PlayerId} does not belong to match {MatchId} teams", playerId, matchId);
            throw new InvalidOperationException("El jugador no pertenece a ninguno de los equipos del partido");
        }

        // V4: El jugador no puede estar registrado dos veces en la misma alineación
        if (await _matchLineUpRepository.ExistsByMatchAndPlayerAsync(matchId, playerId))
        {
            _logger.LogWarning("Player {PlayerId} already registered in match {MatchId} line up", playerId, matchId);
            throw new InvalidOperationException("El jugador ya esta registrado en la alineación de este partido");
        }

        // V5: Máximo 11 titulares por equipo y por partido
        if (isStarter)
        {
            var startersCount = await _matchLineUpRepository.CountStartersByTeamAndMatchAsync(matchId, player.TeamId);
            if (startersCount >= 11)
            {
                _logger.LogWarning("Team {TeamId} already has 11 starters in match {MatchId}", player.TeamId, matchId);
                throw new InvalidOperationException("El equipo ya tiene 11 titulares registrados en este partido");
            }
        }

        // V6: El partido debe estar en estado Scheduled
        if (match.Status != MatchStatus.Scheduled)
        {
            _logger.LogWarning("Match {MatchId} is not in Scheduled status; current status: {Status}", matchId, match.Status);
            throw new InvalidOperationException("Solo se pueden registrar alineaciones en partidos Scheduled");
        }

        // Si todas las validaciones pasan, crear MatchLineUp
        var matchLineUp = new MatchLineUp
        {
            MatchId = matchId,
            PlayerId = playerId,
            IsStarter = isStarter,
            Position = position
        };

        _logger.LogInformation("Creating match line up for match {MatchId} and player {PlayerId}", matchId, playerId);
        return await _matchLineUpRepository.CreateAsync(matchLineUp);
    }

    public async Task UpdateAsync(int id, MatchLineUp matchLineUp)
    {
        var existing = await _matchLineUpRepository.GetByIdAsync(id);
        if (existing == null)
        {
            _logger.LogWarning("Match line up with ID {MatchLineUpId} not found for update", id);
            throw new KeyNotFoundException($"No se encontró la alineación con ID {id}");
        }

        existing.IsStarter = matchLineUp.IsStarter;
        existing.Position = matchLineUp.Position;

        _logger.LogInformation("Updating match line up with ID: {MatchLineUpId}", id);
        await _matchLineUpRepository.UpdateAsync(existing);
    }

    public async Task DeleteAsync(int id)
    {
        var exists = await _matchLineUpRepository.ExistsAsync(id);
        if (!exists)
        {
            _logger.LogWarning("Match line up with ID {MatchLineUpId} not found for deletion", id);
            throw new KeyNotFoundException($"No se encontró la alineación con ID {id}");
        }

        _logger.LogInformation("Deleting match line up with ID: {MatchLineUpId}", id);
        await _matchLineUpRepository.DeleteAsync(id);
    }
}