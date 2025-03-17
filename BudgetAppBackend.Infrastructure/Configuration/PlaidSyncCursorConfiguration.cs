using BudgetAppBackend.Domain.PlaidTransactionAggregate.Entities;
using BudgetAppBackend.Domain.PlaidTransactionAggregate.ValueObjects;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BudgetAppBackend.Infrastructure.Configuration
{
    public class PlaidSyncCursorConfiguration : IEntityTypeConfiguration<PlaidSyncCursor>
    {
        public void Configure(EntityTypeBuilder<PlaidSyncCursor> builder)
        {
            // Configure the primary key with conversion for PlaidSyncCursorId
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Id)
                .HasConversion(
                    id => id.Id,
                    value => PlaidSyncCursorId.Create(value))
                .IsRequired();

            // Configure the UserId property with conversion
            builder.Property(c => c.UserId)
                .HasConversion(
                    id => id.Id,
                    value => UserId.Create(value))
                .IsRequired();

            builder.Property(c => c.ItemId);

            // Configure AccessToken with max length and required constraint
            builder.Property(c => c.AccessToken)
                .IsRequired()
                .HasMaxLength(255);

            // Configure Cursor with max length and required constraint
            builder.Property(c => c.Cursor)
                .IsRequired()
                .HasMaxLength(500);

            // Configure LastSynced as required
            builder.Property(c => c.LastSynced)
                .IsRequired();

            // Configure LastSyncStatus with max length
            builder.Property(c => c.LastSyncStatus)
                .HasMaxLength(100);

            // Define a unique index for UserId and AccessToken combination
            builder.HasIndex(c => new { c.UserId, c.AccessToken, c.ItemId })
                .IsUnique();
        }
    }
}
