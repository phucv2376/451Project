using AutoMapper;
using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using BudgetAppBackend.Domain.UserAggregate;

namespace BudgetAppBackend.Application.AutoMapper
{
    public class ConfigAutoMapper : Profile
    {
        public ConfigAutoMapper()
        {            
            CreateMap<AddUserDto, User>().ReverseMap();
 
        }
    }
}
