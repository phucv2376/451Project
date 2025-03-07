namespace BudgetAppBackend.Infrastructure.SignalR
{
    public interface INotificationClient
    {
        Task ReceiveNotification(string message);
    }
}