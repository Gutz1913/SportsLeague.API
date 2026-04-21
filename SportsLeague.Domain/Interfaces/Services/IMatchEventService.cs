using SportsLeague.Domain.Entities;

namespace SportsLeague.Domain.Interfaces.Services
{
    public interface IMatchEventService
    {
        #region Match Result Methods
        Task<MatchResult> RegisterResultAsync(int matchId, MatchResult result);
        Task<MatchResult?> GetResultByMatchAsync(int matchId);
        #endregion

        #region Goal Methods
        Task<Goal> RegisterGoalAsync(int matchId, Goal goal);
        Task<IEnumerable<Goal>> GetGoalsByMatchAsync(int matchId);
        Task DeleteGoalAsync(int goalId);
        #endregion

        #region Card Methods
        Task<Card> RegisterCardAsync(int matchId, Card card);
        Task<IEnumerable<Card>> GetCardsByMatchAsync(int matchId);
        Task DeleteCardAsync(int cardId);
        #endregion

        //Con esta unificación de servicios, se puede manejar toda la lógica relacionada con los eventos de un partido
        //(resultados, goles, tarjetas) desde un solo punto, lo que facilita el mantenimiento y la coherencia en la aplicación
        //Ademas me evita duplicar codigo en servicios separados para cada tipo de evento, ya que muchos de los procesos
        //(como validación, manejo de errores, etc.) pueden ser compartidos entre ellos.
    }
}
