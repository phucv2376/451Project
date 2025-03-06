using AutoMapper;
using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using BudgetAppBackend.Application.DTOs.BudgetDTOs;
using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Domain.BudgetAggregate;
using BudgetAppBackend.Domain.BudgetAggregate.ValueObjects;
using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.TransactionAggregate;
using BudgetAppBackend.Domain.UserAggregate;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Application.AutoMapper
{
    public class ConfigAutoMapper : Profile
    {
        public ConfigAutoMapper()
        {            
            CreateMap<AddUserDto, User>().ReverseMap();


            CreateMap<CreateTransactionDto, Transaction>()
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => CategoryId.Create(src.CategoryId)))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => UserId.Create(src.UserId)));

            CreateMap<CreateBudgetDto, Budget>()
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => CategoryId.Create(src.CategoryId)))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => UserId.Create(src.UserId)));

            CreateMap<UpdateBudgetDto, Budget>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => BudgetId.Create(src.BudgetId)));


            CreateMap<Budget, BudgetDto>()
                .ForMember(dest => dest.BudgetId, opt => opt.MapFrom(src => src.Id.Id))
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId.Id))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId.Id));

            // Map Transaction → TransactionDto (Entity to DTO)
            /*CreateMap<Transaction, TransactionDto>()
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId.Value))
                .ForMember(dest => dest.BudgetId, opt => opt.MapFrom(src => src.BudgetId != null ? src.BudgetId.Value : (Guid?)null));*/



        }
    }
}
