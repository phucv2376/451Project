using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.Models;
using BudgetAppBackend.Application.Service;
using BudgetAppBackend.Infrastructure.Outbox;
using BudgetAppBackend.Infrastructure.Repositories;
using BudgetAppBackend.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using BudgetAppBackend.Infrastructure.Jobs;

namespace BudgetAppBackend.Infrastructure
{
    public static class InfrastructureServicesRegistration
    {
        public static IServiceCollection RegisterInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("dbConnectionString");
            services.AddSingleton<DomainEventInterceptor>();
            services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
            {
                var interceptor = serviceProvider.GetRequiredService<DomainEventInterceptor>();
                options.UseNpgsql(connectionString,
                                  builder => builder.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName))
                       .AddInterceptors(interceptor);
            });
            services.AddQuartz(q =>
            {
                var jobKey = new JobKey("OutboxProcessor");
                q.AddJob<OutboxProcessor>(jobKey)
                 .AddTrigger(
                    trigger =>
                    trigger.ForJob(jobKey)
                        .WithSimpleSchedule(s =>
                            s.WithIntervalInSeconds(10)
                                .RepeatForever()));

                var resetBudgetJobKey = new JobKey("ResetBudgetJob");
                q.AddJob<ResetBudgetJob>(resetBudgetJobKey)
                 .AddTrigger(trigger => trigger.ForJob(resetBudgetJobKey)
                        .WithSchedule(CronScheduleBuilder.MonthlyOnDayAndHourAndMinute(1, 0, 0)));
            });
            services.AddQuartzHostedService();
            services.AddScoped<IAuthRepository, AuthRepository>();
            services.AddScoped<ITransactionRepository, TransactionRepository>();
            services.AddScoped<IBudgetRepository, BudgetRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            services.Configure<JwtSettings>(configuration.GetSection("JwtSettings").Bind);

            services.AddSingleton<IAuthService, AuthService>();

            // Configure EmailSettings
            services.Configure<EmailSettings>(options =>
            {
                options.SmtpServer = configuration.GetSection("EmailSettings")["SmtpServer"];
                options.SmtpPort = int.TryParse(configuration.GetSection("EmailSettings")["SmtpPort"], out var port) ? port : null;
                options.SenderEmail = configuration.GetSection("EmailSettings")["EmailSender"];
                options.EmailPassword = configuration.GetSection("EmailSettings")["EmailPassword"];
                options.SenderName = configuration.GetSection("EmailSettings")["SenderName"];
            });

            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(typeof(InfrastructureServicesRegistration).Assembly);
            });

            services.AddTransient<IEmailService, EmailService>();

            return services;
        }
    }
}
