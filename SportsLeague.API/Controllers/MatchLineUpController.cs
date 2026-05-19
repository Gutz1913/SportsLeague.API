using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using SportsLeague.API.DTOs.Request;
using SportsLeague.API.DTOs.Response;
using SportsLeague.Domain.Interfaces.Services;

namespace SportsLeague.API.Controllers;

[ApiController]
[Route("api/match/{matchId}/lineup")]
public class MatchLineUpController : ControllerBase
{
    private readonly IMatchLineUpService _matchLineUpService;
    private readonly IMapper _mapper;

    public MatchLineUpController(
        IMatchLineUpService matchLineUpService,
        IMapper mapper)
    {
        _matchLineUpService = matchLineUpService;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MatchLineUpResponseDTO>>> GetAll(int matchId)
    {
        var lineUps = await _matchLineUpService.GetByMatchIdAsync(matchId);
        var lineUpsDto = _mapper.Map<IEnumerable<MatchLineUpResponseDTO>>(lineUps);
        return Ok(lineUpsDto);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MatchLineUpResponseDTO>> GetById(int matchId, int id)
    {
        var lineUp = await _matchLineUpService.GetByIdAsync(id);

        if (lineUp == null || lineUp.MatchId != matchId)
            return NotFound(new { message = $"Alineación con ID {id} no encontrada" });

        // Recargar con las relaciones incluidas para el mapeo
        var lineUpWithDetails = await _matchLineUpService.GetByMatchIdAsync(matchId);
        var lineUpWithRelations = lineUpWithDetails.FirstOrDefault(l => l.Id == id);

        if (lineUpWithRelations == null)
            return NotFound(new { message = $"Alineación con ID {id} no encontrada" });

        var lineUpDto = _mapper.Map<MatchLineUpResponseDTO>(lineUpWithRelations);
        return Ok(lineUpDto);
    }

    [HttpGet("team/{teamId}")]
    public async Task<ActionResult<IEnumerable<MatchLineUpResponseDTO>>> GetByTeam(int matchId, int teamId)
    {
        var lineUps = await _matchLineUpService.GetByMatchAndTeamAsync(matchId, teamId);
        var lineUpsDto = _mapper.Map<IEnumerable<MatchLineUpResponseDTO>>(lineUps);
        return Ok(lineUpsDto);
    }

    [HttpPost]
    public async Task<ActionResult<MatchLineUpResponseDTO>> Create(int matchId, MatchLineUpRequestDTO dto)
    {
        try
        {
            var lineUp = await _matchLineUpService.CreateAsync(matchId, dto.PlayerId, dto.IsStarter, dto.Position);
            var lineUpWithDetails = await _matchLineUpService.GetByIdAsync(lineUp.Id);
            var responseDto = _mapper.Map<MatchLineUpResponseDTO>(lineUpWithDetails);

            return CreatedAtAction(nameof(GetById), new { matchId = matchId, id = responseDto.Id }, responseDto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int matchId, int id)
    {
        try
        {
            var lineUp = await _matchLineUpService.GetByIdAsync(id);
            if (lineUp == null || lineUp.MatchId != matchId)
                return NotFound(new { message = $"Alineación con ID {id} no encontrada" });

            await _matchLineUpService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }
}
