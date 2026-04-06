namespace SportsLeague.API.DTOs.Request;

public class RegisterSponsorDTO
{
    public int SponsorId { get; set; }
    public decimal ContractAmount { get; set; }
    public DateTime? JoinedAt { get; set; } // opcional; si es null se usará UTC now en el servicio
}
