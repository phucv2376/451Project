using BudgetAppBackend.Domain.BudgetAggregate;
using BudgetAppBackend.Domain.BudgetAggregate.ValueObjects;
using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.UserAggregate;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BudgetAppBackend.Infrastructure.Configuration
{
    public class BudgetConfiguration : IEntityTypeConfiguration<Budget>
    {
        public void Configure(EntityTypeBuilder<Budget> builder)
        {

            builder.HasKey(b => b.Id);
            builder.Property(b => b.Id)
                .HasConversion(
                    id => id.Id,
                    value => BudgetId.Create(value)
                )
                .ValueGeneratedNever();

            builder.Property(b => b.UserId)
                .HasConversion(
                    userId => userId.Id,
                    value => UserId.Create(value)
                )
                .IsRequired();

            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Property(b => b.CategoryId)
                .HasConversion(
                    categoryId => categoryId.Id,
                    value => CategoryId.Create(value)
                )
                .IsRequired();

            builder.Property(b => b.Title)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(b => b.TotalAmount)
                .IsRequired()
                .HasPrecision(18, 2);

            builder.Property(b => b.CreatedDate)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(b => b.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.HasIndex(b => b.UserId);
            builder.HasIndex(b => b.CategoryId);
            builder.HasIndex(b => b.CreatedDate);

            builder.ToTable("Budgets");
        }
    }
}
