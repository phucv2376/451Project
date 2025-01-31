using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace BudgetAppBackend.Application
{
    public static class ApplicationServicesRegistration
    {
        public static IServiceCollection RegisterApplicationServices(this IServiceCollection services)
        {
            services.AddMediatR(config => config.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
            services.AddAutoMapper(Assembly.GetExecutingAssembly());
            return services;
        }
    }
}
