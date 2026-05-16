namespace SportsLeague.Domain.Entities;

public class MatchLineUp : AuditBase
{
    public int Id { get; set; }
    public int MatchId { get; set; }
    public int PlayerId { get; set; }
    public bool IsStarter { get; set; }
    public string Position { get; set; } = string.Empty;

    //Navigation properties
    public Match Match { get; set; } = null!;
    public Player Player { get; set; } = null!;

}
