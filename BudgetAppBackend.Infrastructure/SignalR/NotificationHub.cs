using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace BudgetAppBackend.Infrastructure.SignalR
{
    public class NotificationHub : Hub<INotificationClient>
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        [Authorize]
        public override async Task OnConnectedAsync()
        {
           
            var userId = Context.UserIdentifier;

            if (!string.IsNullOrEmpty(userId))
            {
               
                await Clients.User(userId).ReceiveNotification($"🔔 Welcome, User {userId}!");
            }
            else
            {
                
                _logger.LogWarning("⚠️ SignalR: A user connected but `UserIdentifier` is NULL.");
            }

            await base.OnConnectedAsync();
        }


        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;

            if (!string.IsNullOrEmpty(userId))
            {
                _logger.LogInformation($"User {userId} disconnected from SignalR Hub.");
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendNotification(Guid userSId, string message)
        {
            var userId = Context.UserIdentifier;
            await Clients.User(userId).ReceiveNotification(message);
        }

    }


}
