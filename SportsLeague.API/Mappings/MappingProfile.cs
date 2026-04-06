using AutoMapper;
using SportsLeague.API.DTOs.Request;
using SportsLeague.API.DTOs.RequestDTOs;
using SportsLeague.API.DTOs.Response;
using SportsLeague.API.DTOs.ResponseDTOs;
using SportsLeague.Domain.Entities;

namespace SportsLeague.API.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Team mappings
        CreateMap<TeamRequestDTO, Team>();
        CreateMap<Team, TeamResponseDTO>();

        // Player mappings
        CreateMap<PlayerRequestDTO, Player>();
        CreateMap<Player, PlayerResponseDTO>()
            .ForMember(
                dest => dest.TeamName,
                opt => opt.MapFrom(src => src.Team.Name));

        // Referee mappings
        CreateMap<RefereeRequestDTO, Referee>();
        CreateMap<Referee, RefereeResponseDTO>();

        // Tournament mappings
        CreateMap<TournamentRequestDTO, Tournament>();
        CreateMap<Tournament, TournamentResponseDTO>()
            .ForMember(
                dest => dest.TeamsCount,
                opt => opt.MapFrom(src =>
                    src.TournamentTeams != null ? src.TournamentTeams.Count : 0));

        //Sponsor mappings
        CreateMap<SponsorRequestDTO, Sponsor>();
        CreateMap<Sponsor, SponsorResponseDTO>();

        //TournamentSponsor mappings 
        CreateMap<TournamentSponsor, TournamentSponsorDTO>()
            .ForMember(dest => dest.TournamentName, opt => opt.MapFrom(src => src.Tournament != null ? src.Tournament.Name : string.Empty));

        // Sponsor with sponsorships (composed response)
        CreateMap<Sponsor, SponsorWithSponsorshipsDTO>()
            .ForMember(dest => dest.Sponsorships, opt => opt.MapFrom(src => src.TournamentSponsors));

        // RegisterSponsorDTO -> TournamentSponsor (uso en endpoints: necesitas setear TournamentId en el controlador o servicio)
        CreateMap<RegisterSponsorDTO, TournamentSponsor>()
            .ForMember(dest => dest.JoinedAt, opt => opt.MapFrom(src => src.JoinedAt ?? DateTime.UtcNow));

        // Optional: Update category DTO -> Sponsor (if you accept it as payload)
        CreateMap<UpdateSponsorCategoryDTO, Sponsor>()
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category));
    }
}


